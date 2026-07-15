import unittest

from app.services.resume_parser import ResumeParser


class ResumeParserTests(unittest.TestCase):
    def test_parser_keeps_chinese_product_and_collaboration_highlights(self) -> None:
        parser = ResumeParser()
        highlights = parser.parse(
            """
电话：123456
邮箱：test@example.com
出色的跨部门协同与沟通能力：能够有效协调研发、设计、市场、销售等多部门资源，确保信息对齐、目标一致，推动项目顺利交付
行业与业务洞察力：擅长通过市场研究、用户调研和数据分析，精准把握需求，驱动产品方向
项目名称：测试项目
主导产品 0-1 规划与定义：负责从 0 到 1 完成产品能力定位与核心应用场景设计。
"""
        )

        self.assertIn(
            "出色的跨部门协同与沟通能力：能够有效协调研发、设计、市场、销售等多部门资源，确保信息对齐、目标一致，推动项目顺利交付",
            highlights,
        )
        self.assertIn(
            "行业与业务洞察力：擅长通过市场研究、用户调研和数据分析，精准把握需求，驱动产品方向",
            highlights,
        )
        self.assertNotIn("电话：123456", highlights)
        self.assertNotIn("项目名称：测试项目", highlights)

    def test_parser_removes_contact_details_embedded_in_pdf_header(self) -> None:
        parser = ResumeParser()
        highlights = parser.parse(
            """
李明产品经理工作经验：3 年学历：本科【示例大学】电话：13800000000邮箱：demo@example.com
产品全流程能力：熟悉从市场调研、需求分析、产品规划到上线迭代的完整流程。
"""
        )

        self.assertEqual(
            highlights,
            ["产品全流程能力：熟悉从市场调研、需求分析、产品规划到上线迭代的完整流程。"],
        )

    def test_parser_does_not_restore_contact_details_in_fallback(self) -> None:
        parser = ResumeParser()

        highlights = parser.parse("电话：13800000000\n邮箱：demo@example.com")

        self.assertEqual(highlights, [])

    def test_parser_splits_english_action_bullets(self) -> None:
        parser = ResumeParser()

        highlights = parser.parse(
            """
Alex Chen
Product Manager
- Led roadmap planning for an AI product.
- Built weekly KPI dashboards for retention analysis.
"""
        )

        self.assertEqual(
            highlights,
            [
                "Led roadmap planning for an AI product.",
                "Built weekly KPI dashboards for retention analysis.",
            ],
        )


if __name__ == "__main__":
    unittest.main()
