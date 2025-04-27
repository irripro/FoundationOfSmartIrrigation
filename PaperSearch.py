import requests
import pandas as pd

# 替换为你自己的 API 密钥
API_KEY = "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"
# 搜索的查询语句
query = "灌溉工程设计相关资料"
# Tavily Search API 的端点
url = "https://api.tavily.com/search"

# 请求头，包含 API 密钥
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
    # 发送 POST 请求
    response = requests.post(url, headers=headers, json=params)
    # 检查响应状态码
    response.raise_for_status()
    # 解析 JSON 响应
    result = response.json()

    # 假设结果中有 'results' 字段，它是一个包含搜索结果的列表
    if 'results' in result:
        data = result['results']
        # 将数据转换为 DataFrame
        df = pd.DataFrame(data)
        # 将 DataFrame 保存为 Excel 文件
        df.to_excel('tavily_search_results.xlsx', index=False)
        print("数据已成功保存到 tavily_search_results.xlsx")
    else:
        print("未找到 'results' 字段，无法保存数据。")

except requests.exceptions.RequestException as e:
    print(f"请求出错: {e}")
except ValueError as e:
    print(f"解析 JSON 响应出错: {e}")
except Exception as e:
    print(f"保存数据到 Excel 时出错: {e}")
    