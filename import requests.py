import requests

# 替换为你自己的API密钥
API_KEY = "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"
# 搜索的查询语句
query = "灌溉工程设计相关资料"
# Tavily Search API的端点
url = "https://api.tavily.com/search"

# 请求头，包含API密钥
headers = {
    "Authorization": f"Bearer {"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"}"
}

# 请求参数
params = {
    "query": query,
    "search_depth": "advanced",
    "include_domains": ["gov", "edu"],  # 可根据需要调整
    "limit": 10  # 返回结果的数量
}

try:
    # 发送POST请求
    response = requests.post(url, headers=headers, json=params)
    # 检查响应状态码
    response.raise_for_status()
    # 解析JSON响应
    result = response.json()
    print(result)
except requests.exceptions.RequestException as e:
    print(f"请求出错: {e}")
except ValueError as e:
    print(f"解析JSON响应出错: {e}")