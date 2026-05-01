import unittest

from app.utils.text_cleaner import normalize_ocr_spacing, split_meaningful_lines, split_resume_lines


class TextCleanerTests(unittest.TestCase):
    def test_normalize_ocr_spacing_removes_spaces_between_chinese_characters(self) -> None:
        self.assertEqual(
            normalize_ocr_spacing("智 能 化 产 品 经 理 (G 端 )"),
            "智能化产品经理 (G 端)",
        )
        self.assertEqual(
            normalize_ocr_spacing("熟 悉 AI、 大 模 型 、 数 据 分 析 和 用 户 需 求"),
            "熟悉 AI、大模型、数据分析和用户需求",
        )

    def test_split_meaningful_lines_applies_ocr_spacing_cleanup(self) -> None:
        lines = split_meaningful_lines("1. 负 责 智 能 化 产 品 规 划 与 产 品 设 计")

        self.assertEqual(lines, ["负责智能化产品规划与产品设计"])

    def test_split_resume_lines_merges_wrapped_chinese_pdf_lines(self) -> None:
        text = """
主导 AI 融合技术方案与产品设计：首创“专精小模型 + 通用大模型”双引擎架构，协同研
发团队完成技术路径选型与原型验证。输出完整产品原型及 PRD，明确检材挂载、智能修复、
画面增强及行为分析等核心功能，确保 AI 能力贴合实际取证场景。
项目名称：雷电 APP 智能分析
实现产品规模化应用与体验提升：通过 AI 场景持续挖掘与体验优化，推动 AI 能力覆盖核心
分析场景达 60%，产品年度用户量提升 20%。
"""

        lines = split_resume_lines(text)

        self.assertIn(
            "主导 AI 融合技术方案与产品设计：首创“专精小模型 + 通用大模型”双引擎架构，协同研发团队完成技术路径选型与原型验证。输出完整产品原型及 PRD，明确检材挂载、智能修复、画面增强及行为分析等核心功能，确保 AI 能力贴合实际取证场景。",
            lines,
        )
        self.assertIn("项目名称：雷电 APP 智能分析", lines)
        self.assertIn(
            "实现产品规模化应用与体验提升：通过 AI 场景持续挖掘与体验优化，推动 AI 能力覆盖核心分析场景达 60%，产品年度用户量提升 20%。",
            lines,
        )


if __name__ == "__main__":
    unittest.main()
