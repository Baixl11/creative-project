# 验收标准

## 机器验证

- Web UI helper 测试覆盖上传入口标签、中文格式说明和默认格式说明隐藏。
- `.venv/bin/python -m unittest discover -s tests` 通过。
- `.venv/bin/python -m py_compile web_app.py` 通过。

## 行为验证

- 上传 JD 和上传简历仍能分别选择文件。
- 支持格式以中文轻量说明展示，不再依赖默认长文本。
- 上传区保留两个简洁文件入口，不再出现拥挤的英文格式说明。

## 人工验收

- 用户打开上传自己的文件模式，确认两个入口不再像截图中那样丑和拥挤。
