from flask import Flask, request, jsonify
from datetime import datetime

app = Flask(__name__)

@app.route('/detect_pose', methods=['POST'])
def detect_pose():
    """
    示例接口：接收前端上传的图像数据，并返回检测结果。
    这里返回固定示例数据，后续你可以集成真实的姿势检测代码。
    """
    # 这里可以通过 request.files 获取上传的图像，例如：
    # image_file = request.files.get('image')
    
    # 示例返回数据
    result = {
        "pose": "下犬式",
        "score": 85,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    return jsonify(result)

if __name__ == '__main__':
    # 让服务器在局域网中可访问，监听 5000 端口
    app.run(host='0.0.0.0', port=5000, debug=True)

