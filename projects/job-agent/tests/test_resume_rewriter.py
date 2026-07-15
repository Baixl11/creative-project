import unittest

from app.models import MatchReport, RequirementEvidence
from app.services.resume_rewriter import ResumeRewriter


class ResumeRewriterTests(unittest.TestCase):
    def test_rewriter_strengthens_matched_evidence(self) -> None:
        rewriter = ResumeRewriter()
        report = MatchReport(
            score=90,
            matched_requirements=["负责智能化产品的规划与设计"],
            missing_requirements=[],
            rationale=[],
            requirement_evidence=[
                RequirementEvidence(
                    requirement="负责智能化产品的规划与设计",
                    status="matched",
                    best_resume_highlight="主导 AI 产品 0-1 规划，完成需求分析、原型设计和上线推进。",
                    match_strength=0.82,
                    reason="matched",
                )
            ],
        )

        suggestions = rewriter.build_suggestions(report)

        self.assertEqual(len(suggestions), 1)
        self.assertEqual(suggestions[0].suggestion_type, "strengthen")
        self.assertEqual(
            suggestions[0].rewrite_bullet,
            "主导 AI 产品 0-1 规划，完成需求分析、原型设计和上线推进。",
        )
        self.assertEqual(suggestions[0].rewrite_bullet, suggestions[0].current_evidence)
        self.assertEqual(suggestions[0].target_requirement, "负责智能化产品的规划与设计")

    def test_rewriter_builds_gap_template_for_missing_requirement(self) -> None:
        rewriter = ResumeRewriter()
        report = MatchReport(
            score=45,
            matched_requirements=[],
            missing_requirements=["定义增长指标并推动实验迭代"],
            rationale=[],
            requirement_evidence=[
                RequirementEvidence(
                    requirement="定义增长指标并推动实验迭代",
                    status="missing",
                    best_resume_highlight=None,
                    match_strength=0.1,
                    reason="missing",
                )
            ],
        )

        suggestions = rewriter.build_suggestions(report)

        self.assertEqual(len(suggestions), 1)
        self.assertEqual(suggestions[0].suggestion_type, "gap")
        self.assertIn("定义增长指标并推动实验迭代", suggestions[0].rewrite_bullet)
        self.assertIn("提升 X%", suggestions[0].rewrite_bullet)

    def test_rewriter_restructures_ai_delivery_evidence(self) -> None:
        rewriter = ResumeRewriter()
        evidence = (
            "AI 应用场景落地能力：擅长将 AI 技术转化为可落地的产品解决方案，"
            "主导设计“专精小模型+通用大模型”双引擎架构，在视频取证、APP 分析等场景中"
            "实现 AI 覆盖率超 80%、关键流程效率提升 40%以上。"
        )
        report = MatchReport(
            score=95,
            matched_requirements=["与技术团队紧密合作，推动产品功能的实现和优化"],
            missing_requirements=[],
            rationale=[],
            requirement_evidence=[
                RequirementEvidence(
                    requirement="与技术团队紧密合作，推动产品功能的实现和优化",
                    status="matched",
                    best_resume_highlight=evidence,
                    match_strength=0.72,
                    reason="matched",
                )
            ],
        )

        suggestion = rewriter.build_suggestions(report)[0]

        self.assertEqual(
            suggestion.rewrite_bullet,
            "擅长将 AI 技术转化为可落地的产品解决方案，主导设计“专精小模型+通用大模型”双引擎架构，在视频取证、APP 分析等场景中实现 AI 覆盖率超 80%、关键流程效率提升 40%以上。",
        )
        self.assertNotIn("主导 AI 产品能力落地", suggestion.rewrite_bullet)

    def test_rewriter_restructures_product_planning_evidence(self) -> None:
        rewriter = ResumeRewriter()
        evidence = (
            "负责产品 0-1 全流程规划与定义：针对执法/司法机构在视频取证中面临的恢复难、"
            "修复慢、分析效率低等痛点，完成市场需求分析与产品定位。提出“恢复-修复-分析”"
            "一体化能力框架，主导定义行业首个集成视频恢复、智能修复与内容分析的单机取证工具。"
        )
        report = MatchReport(
            score=95,
            matched_requirements=["负责智能化产品的规划与设计，确保产品满足G端市场需求"],
            missing_requirements=[],
            rationale=[],
            requirement_evidence=[
                RequirementEvidence(
                    requirement="负责智能化产品的规划与设计，确保产品满足G端市场需求",
                    status="matched",
                    best_resume_highlight=evidence,
                    match_strength=0.69,
                    reason="matched",
                )
            ],
        )

        suggestion = rewriter.build_suggestions(report)[0]

        self.assertEqual(suggestion.rewrite_bullet, suggestion.current_evidence)
        self.assertIn("针对执法/司法机构在视频取证中面临的恢复难", suggestion.rewrite_bullet)
        self.assertIn("负责产品 0-1 全流程规划与定义", suggestion.rewrite_bullet)

    def test_rewriter_does_not_invent_ownership_domain_or_metrics(self) -> None:
        rewriter = ResumeRewriter()
        examples = [
            (
                "洞察 G 端市场趋势并制定智能化产品策略",
                "完成竞品分析，提出定价建议。",
                ("G 端", "智能化产品定位", "主导"),
            ),
            (
                "主导 AI 产品能力落地",
                "参与 AI 项目测试，实现准确率提升 5%。",
                ("主导", "0-1"),
            ),
            (
                "负责产品 0-1 规划与定义",
                "参与产品设计，完成原型评审。",
                ("负责产品 0-1", "主导"),
            ),
        ]

        for requirement, source, forbidden in examples:
            with self.subTest(source=source):
                report = MatchReport(
                    score=80,
                    matched_requirements=[requirement],
                    missing_requirements=[],
                    rationale=[],
                    requirement_evidence=[
                        RequirementEvidence(
                            requirement=requirement,
                            status="matched",
                            best_resume_highlight=source,
                            match_strength=0.8,
                            reason="matched",
                        )
                    ],
                )

                suggestion = rewriter.build_suggestions(report)[0]

                for phrase in forbidden:
                    self.assertNotIn(phrase, suggestion.rewrite_bullet)

        participant_report = MatchReport(
            score=80,
            matched_requirements=["AI 项目经验"],
            missing_requirements=[],
            rationale=[],
            requirement_evidence=[
                RequirementEvidence(
                    requirement="AI 项目经验",
                    status="matched",
                    best_resume_highlight="参与 AI 项目测试，实现准确率提升 5%。",
                    match_strength=0.8,
                    reason="matched",
                )
            ],
        )
        participant_suggestion = rewriter.build_suggestions(participant_report)[0]
        self.assertIn("参与", participant_suggestion.rewrite_bullet)
        self.assertIn("提升 5%", participant_suggestion.rewrite_bullet)


if __name__ == "__main__":
    unittest.main()
