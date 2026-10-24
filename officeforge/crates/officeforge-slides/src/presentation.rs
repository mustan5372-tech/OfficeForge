use officeforge_core::{Color, DocumentMetadata, Measurement};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::shapes::*;

/// A presentation containing ordered slides.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Presentation {
    pub metadata: DocumentMetadata,
    pub slides: Vec<Slide>,
    pub slide_width: Measurement,
    pub slide_height: Measurement,
    pub theme: PresentationTheme,
}

impl Presentation {
    pub fn new(title: impl Into<String>) -> Self {
        Self {
            metadata: DocumentMetadata::new(title),
            slides: vec![Slide::new()],
            // Default 16:9 widescreen (10" x 5.625")
            slide_width: Measurement::from_inches(10.0),
            slide_height: Measurement::from_inches(5.625),
            theme: PresentationTheme::default(),
        }
    }

    pub fn add_slide(&mut self) -> usize {
        let idx = self.slides.len();
        self.slides.push(Slide::new());
        self.metadata.mark_dirty();
        idx
    }

    pub fn duplicate_slide(&mut self, index: usize) -> Option<usize> {
        if index >= self.slides.len() {
            return None;
        }
        let slide = self.slides[index].clone_with_new_ids();
        let new_idx = index + 1;
        self.slides.insert(new_idx, slide);
        self.metadata.mark_dirty();
        Some(new_idx)
    }

    pub fn delete_slide(&mut self, index: usize) -> Option<Slide> {
        if index >= self.slides.len() || self.slides.len() <= 1 {
            return None; // Don't delete the last slide
        }
        self.metadata.mark_dirty();
        Some(self.slides.remove(index))
    }

    pub fn reorder_slide(&mut self, from: usize, to: usize) -> bool {
        if from >= self.slides.len() || to >= self.slides.len() {
            return false;
        }
        let slide = self.slides.remove(from);
        self.slides.insert(to, slide);
        self.metadata.mark_dirty();
        true
    }

    pub fn slide_count(&self) -> usize {
        self.slides.len()
    }
}

/// A single slide.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Slide {
    pub id: Uuid,
    pub objects: Vec<SlideObject>,
    pub background: SlideBackground,
    pub notes: String,
    pub layout_name: Option<String>,
}

impl Slide {
    pub fn new() -> Self {
        Self {
            id: Uuid::new_v4(),
            objects: Vec::new(),
            background: SlideBackground::default(),
            notes: String::new(),
            layout_name: None,
        }
    }

    /// Create a clone with new UUIDs for all objects.
    pub fn clone_with_new_ids(&self) -> Self {
        let mut slide = self.clone();
        slide.id = Uuid::new_v4();
        for obj in &mut slide.objects {
            obj.id = Uuid::new_v4();
        }
        slide
    }

    pub fn add_object(&mut self, obj: SlideObject) {
        self.objects.push(obj);
    }

    pub fn remove_object(&mut self, id: Uuid) -> Option<SlideObject> {
        if let Some(pos) = self.objects.iter().position(|o| o.id == id) {
            Some(self.objects.remove(pos))
        } else {
            None
        }
    }

    /// Move an object forward in the stacking order.
    pub fn bring_forward(&mut self, id: Uuid) -> bool {
        if let Some(pos) = self.objects.iter().position(|o| o.id == id) {
            if pos + 1 < self.objects.len() {
                self.objects.swap(pos, pos + 1);
                return true;
            }
        }
        false
    }

    /// Move an object backward in the stacking order.
    pub fn send_backward(&mut self, id: Uuid) -> bool {
        if let Some(pos) = self.objects.iter().position(|o| o.id == id) {
            if pos > 0 {
                self.objects.swap(pos, pos - 1);
                return true;
            }
        }
        false
    }
}

impl Default for Slide {
    fn default() -> Self {
        Self::new()
    }
}

/// Slide background.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SlideBackground {
    Solid(Color),
    Gradient { start: Color, end: Color, angle: f64 },
    Image { path: String },
}

impl Default for SlideBackground {
    fn default() -> Self {
        Self::Solid(Color::WHITE)
    }
}

/// Presentation theme (simplified).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresentationTheme {
    pub name: String,
    pub primary_color: Color,
    pub secondary_color: Color,
    pub background_color: Color,
    pub text_color: Color,
    pub heading_font: String,
    pub body_font: String,
}

impl Default for PresentationTheme {
    fn default() -> Self {
        Self {
            name: "Default".to_string(),
            primary_color: Color::new(68, 114, 196),
            secondary_color: Color::new(237, 125, 49),
            background_color: Color::WHITE,
            text_color: Color::BLACK,
            heading_font: "Calibri Light".to_string(),
            body_font: "Calibri".to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_presentation() {
        let pres = Presentation::new("Test");
        assert_eq!(pres.slide_count(), 1);
    }

    #[test]
    fn test_add_and_delete_slides() {
        let mut pres = Presentation::new("Test");
        pres.add_slide();
        pres.add_slide();
        assert_eq!(pres.slide_count(), 3);

        pres.delete_slide(1);
        assert_eq!(pres.slide_count(), 2);
    }

    #[test]
    fn test_cannot_delete_last_slide() {
        let mut pres = Presentation::new("Test");
        assert!(pres.delete_slide(0).is_none());
        assert_eq!(pres.slide_count(), 1);
    }

    #[test]
    fn test_duplicate_slide() {
        let mut pres = Presentation::new("Test");
        pres.slides[0].objects.push(SlideObject::new_textbox(
            Measurement::from_inches(1.0),
            Measurement::from_inches(1.0),
            Measurement::from_inches(4.0),
            Measurement::from_inches(2.0),
            "Hello".to_string(),
        ));

        let new_idx = pres.duplicate_slide(0).unwrap();
        assert_eq!(new_idx, 1);
        assert_eq!(pres.slide_count(), 2);
        // IDs should be different
        assert_ne!(pres.slides[0].id, pres.slides[1].id);
    }

    #[test]
    fn test_reorder_slides() {
        let mut pres = Presentation::new("Test");
        pres.add_slide();
        pres.add_slide();

        let id0 = pres.slides[0].id;
        let id2 = pres.slides[2].id;

        pres.reorder_slide(0, 2);
        assert_eq!(pres.slides[2].id, id0);
        assert_eq!(pres.slides[1].id, id2);
    }

    #[test]
    fn test_z_order() {
        let mut slide = Slide::new();
        let obj1 = SlideObject::new_textbox(
            Measurement::ZERO, Measurement::ZERO,
            Measurement::from_inches(1.0), Measurement::from_inches(1.0),
            "First".into(),
        );
        let obj2 = SlideObject::new_textbox(
            Measurement::ZERO, Measurement::ZERO,
            Measurement::from_inches(1.0), Measurement::from_inches(1.0),
            "Second".into(),
        );
        let id1 = obj1.id;
        slide.add_object(obj1);
        slide.add_object(obj2);

        assert_eq!(slide.objects[0].id, id1);
        slide.bring_forward(id1);
        assert_eq!(slide.objects[1].id, id1);
    }
}
