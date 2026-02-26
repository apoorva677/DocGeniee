from backend.modules.content_processor import ContentProcessor
from backend.modules.ai_generator import AIGenerator
from backend.modules.structure_classifier import StructureClassifier
from backend.modules.formatting_engine import FormattingEngine
from backend.modules.quality_evaluator import QualityEvaluator


def test_no_headings():
    """Test processing content with no headings."""
    processor = ContentProcessor()
    generator = AIGenerator()
    classifier = StructureClassifier()
    formatter = FormattingEngine()
    evaluator = QualityEvaluator()

    content = "This is a paragraph. Another paragraph here."
    document = processor.process("Test Document", content, "academic", "standard")
    document = generator.enhance_document(document)
    document = classifier.classify(document)
    document = formatter.apply_formatting(document)
    metrics = evaluator.evaluate(document)
    document.metadata = metrics

    # Assertions
    assert len(document.sections) == 1
    assert document.sections[0].heading == "Introduction"
    blocks = document.sections[0].blocks
    assert len(blocks) >= 2  # heading + at least one paragraph
    assert blocks[0].type == "heading"
    assert all(b.type == "paragraph" for b in blocks[1:])
    assert all(b.style is not None for b in blocks)
    print("Test no headings: PASSED")
    print(document.model_dump())


def test_numbered_headings():
    """Test processing content with numbered headings."""
    processor = ContentProcessor()
    generator = AIGenerator()
    classifier = StructureClassifier()
    formatter = FormattingEngine()
    evaluator = QualityEvaluator()

    content = """1. Introduction
This is the introduction section.

1.1 Background
This explains the background of the topic.

2. Conclusion
This concludes the document."""
    document = processor.process("Test Document", content, "academic", "standard")
    document = generator.enhance_document(document)
    document = classifier.classify(document)
    document = formatter.apply_formatting(document)
    metrics = evaluator.evaluate(document)
    document.metadata = metrics

    # Assertions
    assert len(document.sections) == 3
    assert document.sections[0].heading == "1. Introduction"
    assert document.sections[0].level == 1
    assert document.sections[1].heading == "1.1 Background"
    assert document.sections[1].level == 2
    assert document.sections[2].heading == "2. Conclusion"
    assert document.sections[2].level == 1
    # Check blocks have styles
    for section in document.sections:
        for block in section.blocks:
            assert block.style is not None
    print("Test numbered headings: PASSED")
    print(document.model_dump())


def test_mixed_content():
    """Test processing mixed content with headings, paragraphs, and lists."""
    processor = ContentProcessor()
    generator = AIGenerator()
    classifier = StructureClassifier()
    formatter = FormattingEngine()
    evaluator = QualityEvaluator()

    content = """1. Overview
This is an overview paragraph.

- Item one
- Item two

1.1 Details
More details here."""
    document = processor.process("Test Document", content, "technical", "standard")
    document = generator.enhance_document(document)
    document = classifier.classify(document)
    document = formatter.apply_formatting(document)
    metrics = evaluator.evaluate(document)
    document.metadata = metrics

    # Assertions
    assert len(document.sections) == 2
    assert document.sections[0].heading == "1. Overview"
    assert document.sections[1].heading == "1.1 Details"
    # Check for list blocks
    list_blocks = [b for s in document.sections for b in s.blocks if b.type == "list"]
    assert len(list_blocks) == 2
    # Check styles
    for section in document.sections:
        for block in section.blocks:
            assert block.style is not None
    print("Test mixed content: PASSED")
    print(document.model_dump())


if __name__ == "__main__":
    test_no_headings()
    test_numbered_headings()
    test_mixed_content()
    print("All tests passed!")
