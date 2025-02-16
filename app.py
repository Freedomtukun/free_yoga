###############################################
# app.py
###############################################
from flask import Flask, request, jsonify, render_template
import cv2
import mediapipe as mp
import numpy as np
import math
import datetime

app = Flask(__name__)

# 初始化 Mediapipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

###############################################
# 计算 ∠ABC 的辅助函数
###############################################
def calc_angle(A, B, C):
    """
    计算 ∠ABC 的角度（单位：度）。
    A, B, C 分别是 (x, y)，表示三个关键点的坐标。
    返回浮点数 angle。
    """
    BA = (A[0] - B[0], A[1] - B[1])
    BC = (C[0] - B[0], C[1] - B[1])

    dot = BA[0]*BC[0] + BA[1]*BC[1]    # 点积
    magBA = math.sqrt(BA[0]**2 + BA[1]**2)
    magBC = math.sqrt(BC[0]**2 + BC[1]**2)

    if magBA == 0 or magBC == 0:
        return 0.0

    cos_angle = dot / (magBA * magBC)
    cos_angle = max(min(cos_angle, 1.0), -1.0)
    angle = math.degrees(math.acos(cos_angle))
    return angle

###############################################
# 根据角度给出评分、动作描述
###############################################
def evaluate_pose(angles):
    """
    angles: dict, 例如 {'left_arm': 160.5, 'right_arm': 170.2}
    返回 (score, pose_desc)
    """
    score = 0

    # 简单示例：如果 left_arm 在 [150,180]，加50分
    if 150 <= angles.get('left_arm', 0) <= 180:
        score += 50

    # 如果 right_arm 在 [150,180]，再加50分
    if 150 <= angles.get('right_arm', 0) <= 180:
        score += 50

    # 动作描述
    if score == 100:
        pose_desc = "完美"
    elif score >= 50:
        pose_desc = "还可以"
    else:
        pose_desc = "不完美"

    return score, pose_desc

###############################################
# 路由：渲染前端页面
###############################################
@app.route('/')
def index():
    # 显示 templates/index.html
    return render_template('index.html')

###############################################
# 路由：接收图像并做姿势检测
###############################################
@app.route('/detect_pose', methods=['POST'])
def detect_pose():
    # 1. 检查是否有 'image' 文件
    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400

    file = request.files['image']
    np_arr = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({'error': 'Failed to decode image'}), 400

    # 2. 用 Mediapipe Pose 进行检测
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)
    if not results.pose_landmarks:
        return jsonify({'error': 'No pose detected'}), 200

    # 3. 获取关键点坐标
    h, w, _ = img.shape
    landmarks = results.pose_landmarks.landmark

    # 左肩、左肘、左腕
    left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
    left_elbow    = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
    left_wrist    = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
    sx, sy = int(left_shoulder.x * w), int(left_shoulder.y * h)
    ex, ey = int(left_elbow.x    * w), int(left_elbow.y    * h)
    wx, wy = int(left_wrist.x    * w), int(left_wrist.y    * h)
    left_arm_angle = calc_angle((sx, sy), (ex, ey), (wx, wy))

    # 右肩、右肘、右腕
    right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
    right_elbow    = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
    right_wrist    = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]
    sx2, sy2 = int(right_shoulder.x * w), int(right_shoulder.y * h)
    ex2, ey2 = int(right_elbow.x    * w), int(right_elbow.y    * h)
    wx2, wy2 = int(right_wrist.x    * w), int(right_wrist.y    * h)
    right_arm_angle = calc_angle((sx2, sy2), (ex2, ey2), (wx2, wy2))

    # 4. 组装角度数据
    angles = {
        'left_arm':  round(left_arm_angle, 2),
        'right_arm': round(right_arm_angle, 2)
    }

    # 5. 评分 & 动作描述
    score, pose_desc = evaluate_pose(angles)

    # 6. 时间戳
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 7. 返回 JSON
    return jsonify({
        'angles': angles,
        'score': score,
        'pose': pose_desc,
        'timestamp': timestamp
    }), 200

###############################################
# 主入口
###############################################
if __name__ == '__main__':
    # 监听所有地址，方便局域网下手机访问
    app.run(host='0.0.0.0', port=5000, debug=True)

