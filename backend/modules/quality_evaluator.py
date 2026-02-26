from backend.models.document_model import Document


class QualityEvaluator:
    """
    QualityEvaluator calculates quality metrics for a document.
    """

    def evaluate(self, document: Document) -> dict:
        """
        Evaluate document quality and return metrics.
        """
        structure_score = self._calculate_structure_consistency(document)
        formatting_score = self._calculate_formatting_consistency(document)
        readability_score = self._calculate_readability(document)
        return {
            "structure_consistency": structure_score,
            "formatting_consistency": formatting_score,
            "readability": readability_score
        }

    def _calculate_structure_consistency(self, document: Document) -> int:
        """
        Calculate structure consistency score (0-100).
        Checks if sections have valid levels and headings.
        """
        if not document.sections:
            return 0
        valid_levels = all(s.level > 0 for s in document.sections)
        has_headings = all(s.heading.strip() for s in document.sections)
        score = 50 if valid_levels else 0
        score += 50 if has_headings else 0
        return min(100, score)

    def _calculate_formatting_consistency(self, document: Document) -> int:
        """
        Calculate formatting consistency score (0-100).
        Checks if blocks have styles applied.
        """
        total_blocks = sum(len(s.blocks) for s in document.sections)
        if total_blocks == 0:
            return 100
        styled_blocks = sum(1 for s in document.sections for b in s.blocks if b.style)
        return int((styled_blocks / total_blocks) * 100)

    def _calculate_readability(self, document: Document) -> int:
        """
        Calculate readability approximation score (0-100).
        Based on average sentence length and content length.
        """
        content = ' '.join(b.content for s in document.sections for b in s.blocks)
        words = content.split()
        sentences = content.split('.')
        if not sentences:
            return 0
        avg_words_per_sentence = len(words) / len(sentences)
        score = max(0, 100 - abs(avg_words_per_sentence - 15) * 2)  # ideal ~15 words
        return int(score)