import unittest

from app.services.jd_parser import JDParser


class JDParserTests(unittest.TestCase):
    def test_parser_skips_chinese_section_labels(self) -> None:
        parser = JDParser()
        job_title, requirements = parser.parse(
            """
智能化产品经理（G端）

标签：G端产品/政务产品、AI产品
岗位职责
1. 负责智能化产品的规划与设计，确保产品满足G端市场需求
2. 与技术团队紧密合作，推动产品功能的实现和优化
任职要求
1. 具备出色的跨部门沟通能力，能够协调资源推进项目
员工福利
交通补助、生日福利
"""
        )

        self.assertEqual(job_title, "智能化产品经理（G端）")
        self.assertIn("负责智能化产品的规划与设计，确保产品满足G端市场需求", requirements)
        self.assertIn("具备出色的跨部门沟通能力，能够协调资源推进项目", requirements)
        self.assertNotIn("岗位职责", requirements)
        self.assertNotIn("任职要求", requirements)
        self.assertNotIn("交通补助、生日福利", requirements)

    def test_parser_skips_chinese_section_label_with_colon_after_ocr_cleanup(self) -> None:
        parser = JDParser()
        job_title, requirements = parser.parse(
            """
智 能 化 产 品 经 理 (G 端 )
岗 位 要 求 :
1. 负 责 智 能 化 产 品 规 划 与 产 品 设 计
2. 熟 悉 AI、 大 模 型 、 数 据 分 析 和 用 户 需 求
"""
        )

        self.assertEqual(job_title, "智能化产品经理 (G 端)")
        self.assertEqual(
            requirements,
            [
                "负责智能化产品规划与产品设计",
                "熟悉 AI、大模型、数据分析和用户需求",
            ],
        )

    def test_parser_keeps_ignored_section_active_until_next_known_section(self) -> None:
        parser = JDParser()

        _, requirements = parser.parse(
            """
AI 产品经理
员工福利：
提供产品培训、用户活动与技术分享
五险一金与年度体检
任职要求：
具备 AI 产品规划经验
"""
        )

        self.assertEqual(requirements, ["具备 AI 产品规划经验"])

    def test_parser_includes_preferred_qualifications(self) -> None:
        parser = JDParser()

        _, requirements = parser.parse(
            """
Product Manager
Preferred Qualifications
Experience shipping AI workflow products.
"""
        )

        self.assertEqual(requirements, ["Experience shipping AI workflow products."])


if __name__ == "__main__":
    unittest.main()
