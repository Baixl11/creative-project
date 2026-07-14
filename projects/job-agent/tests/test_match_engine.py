import unittest

from app.services.match_engine import MatchEngine


class MatchEngineTests(unittest.TestCase):
    def test_match_engine_detects_overlap(self) -> None:
        engine = MatchEngine()
        requirements = [
            "Experience with experimentation, analytics, and SQL or dashboard tools.",
            "Strong written communication and stakeholder management.",
        ]
        resume_highlights = [
            "Built weekly KPI dashboards and partnered with data teammates to track activation experiments.",
            "Aligned stakeholders across design and engineering with clear PRDs.",
        ]

        result = engine.evaluate(requirements, resume_highlights)

        self.assertGreaterEqual(result.score, 60)
        self.assertEqual(len(result.matched_requirements), 2)
        self.assertEqual(result.missing_requirements, [])
        self.assertEqual(len(result.requirement_evidence), 2)
        self.assertEqual(result.requirement_evidence[0].status, "matched")
        self.assertEqual(
            result.requirement_evidence[0].best_resume_highlight,
            "Built weekly KPI dashboards and partnered with data teammates to track activation experiments.",
        )

    def test_match_engine_surfaces_missing_requirements(self) -> None:
        engine = MatchEngine()
        requirements = [
            "Comfort working with AI products or automation workflows.",
            "Ability to turn ambiguous problems into simple product plans.",
        ]
        resume_highlights = [
            "Owned the launch checklist for a legacy reporting feature.",
        ]

        result = engine.evaluate(requirements, resume_highlights)

        self.assertLess(result.score, 60)
        self.assertGreaterEqual(len(result.missing_requirements), 1)

    def test_match_engine_does_not_over_match_generic_product_overlap(self) -> None:
        engine = MatchEngine()
        requirements = [
            "Work with LLM-powered product features and evaluate quality.",
        ]
        resume_highlights = [
            "Managed weekly stakeholder updates for a B2B workflow product and clarified launch priorities.",
        ]

        result = engine.evaluate(requirements, resume_highlights)

        self.assertEqual(result.matched_requirements, [])
        self.assertEqual(result.missing_requirements, requirements)
        self.assertEqual(result.requirement_evidence[0].status, "missing")
        self.assertEqual(
            result.requirement_evidence[0].best_resume_highlight,
            "Managed weekly stakeholder updates for a B2B workflow product and clarified launch priorities.",
        )
        self.assertLess(result.requirement_evidence[0].match_strength, 0.22)

    def test_match_engine_supports_chinese_product_ai_overlap(self) -> None:
        engine = MatchEngine()
        requirements = [
            "负责智能化产品的规划与设计，确保产品满足G端市场需求",
            "与技术团队紧密合作，推动产品功能的实现和优化",
            "对智能化产品有深刻理解，能够洞察用户需求并转化为产品特性",
        ]
        resume_highlights = [
            "主导 AI 融合技术方案与产品设计：首创专精小模型 + 通用大模型双引擎架构，协同研发推进落地。",
            "主导产品 0-1 规划与定义：负责从 0 到 1 规划灵脉 SAST 静态应用安全平台，通过调研内部用户需求完成产品功能设计。",
            "实现产品规模化应用与体验提升：通过 AI 场景持续挖掘与体验优化，推动 AI 能力覆盖核心流程。",
        ]

        result = engine.evaluate(requirements, resume_highlights)

        self.assertGreaterEqual(result.score, 70)
        self.assertEqual(len(result.matched_requirements), 3)
        self.assertEqual(result.missing_requirements, [])
        self.assertIn("产品", result.requirement_evidence[0].best_resume_highlight)

    def test_match_engine_prefers_direct_evidence_when_scores_tie(self) -> None:
        engine = MatchEngine()
        requirement = "具备出色的跨部门沟通能力，能够协调资源推进项目"
        direct_highlight = (
            "出色的跨部门协同与沟通能力：能够有效协调研发、设计、市场、销售等多部门资源，"
            "确保信息对齐、目标一致，推动项目顺利交付。"
        )
        resume_highlights = [
            "AI 应用场景落地能力：熟悉 AI 产品从需求识别、技术可行性判断到方案落地的完整流程。",
            direct_highlight,
        ]

        result = engine.evaluate([requirement], resume_highlights)

        self.assertEqual(result.requirement_evidence[0].best_resume_highlight, direct_highlight)

    def test_synonym_group_contributes_at_most_one_support_unit(self) -> None:
        engine = MatchEngine()
        requirement_tokens = engine._tokenize("AI LLM 与大模型")
        resume_tokens = engine._tokenize("参与 AI 项目测试")

        support_units = engine._count_support_units(requirement_tokens, resume_tokens)
        result = engine.evaluate(["AI LLM 与大模型"], ["参与 AI 项目测试"])

        self.assertEqual(support_units, 1)
        self.assertLessEqual(result.requirement_evidence[0].match_strength, 1.0)

    def test_match_engine_does_not_treat_optimization_as_team_collaboration(self) -> None:
        engine = MatchEngine()
        requirement = "与技术团队合作"

        result = engine.evaluate([requirement], ["负责优化落地"])

        self.assertEqual(result.matched_requirements, [])
        self.assertEqual(result.missing_requirements, [requirement])
        self.assertLess(result.requirement_evidence[0].match_strength, 0.22)
        self.assertLess(result.score, 20)

    def test_match_engine_returns_zero_when_no_requirements_exist(self) -> None:
        engine = MatchEngine()

        result = engine.evaluate([], ["Led an AI product launch."])

        self.assertEqual(result.score, 0)
        self.assertEqual(result.matched_requirements, [])


if __name__ == "__main__":
    unittest.main()
