use officeforge_core::{Color, FontSpec, Measurement};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// An object on a slide (text box, shape, image, etc.).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideObject {
    pub id: Uuid,
    pub x: Measurement,
    pub y: Measurement,
    pub width: Measurement,
    pub height: Measurement,
    pub rotation: f64,
    pub content: SlideObjectContent,
    pub fill: Option<ShapeFill>,
    pub border: Option<ShapeBorder>,
}

impl SlideObject {
    pub fn new_textbox(x: Measurement, y: Measurement, width: Measurement, height: Measurement, text: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            x,
            y,
            width,
            height,
            rotation: 0.0,
            content: SlideObjectContent::TextBox(TextBox {
                paragraphs: vec![SlideParagraph::with_text(text)],
            }),
            fill: None,
            border: None,
        }
    }

    pub fn new_shape(x: Measurement, y: Measurement, width: Measurement, height: Measurement, shape_type: ShapeType) -> Self {
        Self {
            id: Uuid::new_v4(),
            x,
            y,
            width,
            height,
            rotation: 0.0,
            content: SlideObjectContent::Shape(Shape {
                shape_type,
                text: None,
            }),
            fill: Some(ShapeFill::Solid(Color::new(68, 114, 196))),
            border: Some(ShapeBorder {
                color: Color::new(47, 82, 143),
                width_pt: 1.0,
            }),
        }
    }

    pub fn new_image(x: Measurement, y: Measurement, width: Measurement, height: Measurement, path: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            x,
            y,
            width,
            height,
            rotation: 0.0,
            content: SlideObjectContent::Image(SlideImage {
                source_path: path,
                alt_text: String::new(),
            }),
            fill: None,
            border: None,
        }
    }
}

/// The content type of a slide object.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SlideObjectContent {
    TextBox(TextBox),
    Shape(Shape),
    Image(SlideImage),
    Line(Line),
}

/// A text box containing paragraphs.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TextBox {
    pub paragraphs: Vec<SlideParagraph>,
}

/// A paragraph within a slide text element.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideParagraph {
    pub runs: Vec<SlideTextRun>,
    pub alignment: SlideTextAlignment,
}

impl SlideParagraph {
    pub fn with_text(text: String) -> Self {
        Self {
            runs: vec![SlideTextRun { text, font: FontSpec::default(), color: Color::BLACK }],
            alignment: SlideTextAlignment::Left,
        }
    }
}

/// A text run within a slide paragraph.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideTextRun {
    pub text: String,
    pub font: FontSpec,
    pub color: Color,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum SlideTextAlignment {
    Left,
    Center,
    Right,
    Justify,
}

/// A geometric shape.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Shape {
    pub shape_type: ShapeType,
    pub text: Option<TextBox>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ShapeType {
    Rectangle,
    RoundedRectangle,
    Ellipse,
    Triangle,
    Diamond,
    Pentagon,
    Hexagon,
    Arrow,
    Star,
}

/// An image on a slide.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SlideImage {
    pub source_path: String,
    pub alt_text: String,
}

/// A line or connector.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Line {
    pub start_x: Measurement,
    pub start_y: Measurement,
    pub end_x: Measurement,
    pub end_y: Measurement,
    pub color: Color,
    pub width_pt: f64,
}

/// Shape fill type.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ShapeFill {
    Solid(Color),
    Gradient { start: Color, end: Color, angle: f64 },
    NoFill,
}

/// Shape border.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShapeBorder {
    pub color: Color,
    pub width_pt: f64,
}
