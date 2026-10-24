use officeforge_core::error::{OfficeForgeError, Result};
use std::collections::HashMap;
use std::io::{Read, Seek};
use tracing::{debug, warn};

/// Maximum decompressed size allowed (256 MB).
const MAX_DECOMPRESSED_SIZE: u64 = 256 * 1024 * 1024;
/// Maximum number of entries in a ZIP file.
const MAX_ENTRIES: usize = 10_000;

/// An OOXML package (ZIP file containing XML parts and resources).
pub struct OoxmlPackage {
    pub content_types: String,
    pub parts: HashMap<String, Vec<u8>>,
    pub relationships: HashMap<String, Vec<Relationship>>,
}

/// A relationship in an OOXML package.
#[derive(Debug, Clone)]
pub struct Relationship {
    pub id: String,
    pub rel_type: String,
    pub target: String,
    pub target_mode: Option<String>,
}

impl OoxmlPackage {
    /// Read an OOXML package from a ZIP archive with security validation.
    pub fn read<R: Read + Seek>(reader: R) -> Result<Self> {
        let mut archive = zip::ZipArchive::new(reader)
            .map_err(|e| OfficeForgeError::Zip(format!("Failed to open ZIP: {e}")))?;

        if archive.len() > MAX_ENTRIES {
            return Err(OfficeForgeError::Zip(format!(
                "Too many entries in ZIP: {} (max: {MAX_ENTRIES})",
                archive.len()
            )));
        }

        let mut parts: HashMap<String, Vec<u8>> = HashMap::new();
        let mut total_decompressed: u64 = 0;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i)
                .map_err(|e| OfficeForgeError::Zip(format!("Failed to read entry {i}: {e}")))?;

            let name = file.name().to_string();

            // Security: prevent path traversal
            if name.contains("..") || name.starts_with('/') || name.starts_with('\\') {
                warn!("Skipping potentially dangerous path: {name}");
                continue;
            }

            // Security: enforce decompression limit
            total_decompressed += file.size();
            if total_decompressed > MAX_DECOMPRESSED_SIZE {
                return Err(OfficeForgeError::Zip(format!(
                    "Decompressed size exceeds {MAX_DECOMPRESSED_SIZE} bytes"
                )));
            }

            let mut content = Vec::with_capacity(file.size() as usize);
            file.read_to_end(&mut content)
                .map_err(|e| OfficeForgeError::Zip(format!("Failed to decompress {name}: {e}")))?;

            debug!("Read package part: {name} ({} bytes)", content.len());
            parts.insert(name, content);
        }

        // Extract content types
        let content_types = parts
            .get("[Content_Types].xml")
            .map(|b| String::from_utf8_lossy(b).to_string())
            .unwrap_or_default();

        // Parse relationships
        let mut relationships: HashMap<String, Vec<Relationship>> = HashMap::new();
        let rel_keys: Vec<String> = parts.keys()
            .filter(|k| k.ends_with(".rels"))
            .cloned()
            .collect();

        for key in rel_keys {
            if let Some(data) = parts.get(&key) {
                let rels = parse_relationships(&String::from_utf8_lossy(data));
                if !rels.is_empty() {
                    relationships.insert(key, rels);
                }
            }
        }

        Ok(Self {
            content_types,
            parts,
            relationships,
        })
    }

    /// Get a part's content as a UTF-8 string.
    pub fn get_part_string(&self, path: &str) -> Option<String> {
        self.parts.get(path).map(|b| String::from_utf8_lossy(b).to_string())
    }

    /// Get a part's raw bytes.
    pub fn get_part_bytes(&self, path: &str) -> Option<&[u8]> {
        self.parts.get(path).map(|v| v.as_slice())
    }

    /// Check if the package appears to be a valid OOXML file.
    pub fn validate(&self) -> Vec<String> {
        let mut warnings = Vec::new();

        if !self.parts.contains_key("[Content_Types].xml") {
            warnings.push("Missing [Content_Types].xml".to_string());
        }
        if !self.parts.contains_key("_rels/.rels") {
            warnings.push("Missing _rels/.rels".to_string());
        }

        warnings
    }

    /// Detect the document type from content types.
    pub fn detect_type(&self) -> Option<&'static str> {
        if self.content_types.contains("wordprocessingml") {
            Some("docx")
        } else if self.content_types.contains("spreadsheetml") {
            Some("xlsx")
        } else if self.content_types.contains("presentationml") {
            Some("pptx")
        } else {
            None
        }
    }
}

/// Parse a .rels XML file into a list of relationships.
fn parse_relationships(xml: &str) -> Vec<Relationship> {
    let mut rels = Vec::new();
    let mut reader = quick_xml::Reader::from_str(xml);
    let mut buf = Vec::new();

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(quick_xml::events::Event::Empty(ref e)) | Ok(quick_xml::events::Event::Start(ref e))
                if e.name().as_ref() == b"Relationship" =>
            {
                let mut id = String::new();
                let mut rel_type = String::new();
                let mut target = String::new();
                let mut target_mode = None;

                for attr in e.attributes().flatten() {
                    match attr.key.as_ref() {
                        b"Id" => id = String::from_utf8_lossy(&attr.value).to_string(),
                        b"Type" => rel_type = String::from_utf8_lossy(&attr.value).to_string(),
                        b"Target" => target = String::from_utf8_lossy(&attr.value).to_string(),
                        b"TargetMode" => target_mode = Some(String::from_utf8_lossy(&attr.value).to_string()),
                        _ => {}
                    }
                }

                if !id.is_empty() {
                    rels.push(Relationship { id, rel_type, target, target_mode });
                }
            }
            Ok(quick_xml::events::Event::Eof) => break,
            Err(e) => {
                warn!("Error parsing relationships XML: {e}");
                break;
            }
            _ => {}
        }
        buf.clear();
    }

    rels
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_relationships() {
        let xml = r#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>"#;

        let rels = parse_relationships(xml);
        assert_eq!(rels.len(), 2);
        assert_eq!(rels[0].id, "rId1");
        assert_eq!(rels[0].target, "word/document.xml");
        assert_eq!(rels[1].id, "rId2");
    }
}
