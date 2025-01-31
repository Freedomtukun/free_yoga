import cv2
import mediapipe as mp
import numpy as np

# 初始化 MediaPipe 姿势检测
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# 计算两个点的夹角（用于姿势评分）
def calculate_angle(a, b, c):
    a = np.array(a)  # 第一个点
    b = np.array(b)  # 中心点
    c = np.array(c)  # 第三个点

    ba = a - b
    bc = c - b

    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))

    return np.degrees(angle)

# 预设标准瑜伽姿势角度（例如战士式）
STANDARD_ANGLES = {
    "left_elbow": 160,  # 左肘标准角度
    "right_elbow": 160,  # 右肘标准角度
    "left_knee": 90,  # 左膝标准角度
    "right_knee": 90   # 右膝标准角度
}

# 读取摄像头
cap = cv2.VideoCapture(0)

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    # 转换为 RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        # 获取关键点坐标
        shoulder_l = [landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].x,
                      landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value].y]
        elbow_l = [landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value].y]
        wrist_l = [landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value].y]

        shoulder_r = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                      landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        elbow_r = [landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].x,
                   landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value].y]
        wrist_r = [landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].x,
                   landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value].y]

        hip_l = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x,
                 landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        knee_l = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x,
                  landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        ankle_l = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x,
                   landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]

        hip_r = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                 landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
        knee_r = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                  landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]
        ankle_r = [landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].x,
                   landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value].y]

        # 计算角度
        angles = {
            "left_elbow": calculate_angle(shoulder_l, elbow_l, wrist_l),
            "right_elbow": calculate_angle(shoulder_r, elbow_r, wrist_r),
            "left_knee": calculate_angle(hip_l, knee_l, ankle_l),
            "right_knee": calculate_angle(hip_r, knee_r, ankle_r)
        }

        # 计算姿势正确率（与标准角度对比）
        scores = []
        for joint, angle in angles.items():
            standard_angle = STANDARD_ANGLES[joint]
            score = max(0, 100 - abs(standard_angle - angle))  # 计算分数（100 - 角度偏差）
            scores.append(score)

        # 计算总平均得分
        final_score = int(np.mean(scores))

        # 显示分数
        cv2.putText(frame, f"Score: {final_score}%", (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)

        # 画出关键点
        mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

    # 显示视频
    cv2.imshow('Yoga Pose Evaluation', frame)

    # 按 'q' 退出
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# 释放摄像头
cap.release()
cv2.destroyAllWindows()
# 预设标准瑜伽姿势角度
POSES = {
    "warrior": {  # 战士式
        "left_elbow": 160,
        "right_elbow": 160,
        "left_knee": 90,
        "right_knee": 90
    },
    "tree": {  # 树式
        "left_knee": 45,
        "right_knee": 45
    },
    "downward_dog": {  # 下犬式
        "left_elbow": 180,
        "right_elbow": 180,
        "left_knee": 180,
        "right_knee": 180
    }
}
# 计算姿势正确率（匹配不同瑜伽姿势）
best_pose = "Unknown"
best_score = 0

for pose_name, angles_dict in POSES.items():
    scores = []
    for joint, standard_angle in angles_dict.items():
        if joint in angles:
            score = max(0, 100 - abs(standard_angle - angles[joint]))  # 计算分数
            scores.append(score)

    pose_score = int(np.mean(scores))
    if pose_score > best_score:
        best_score = pose_score
        best_pose = pose_name  # 选择最佳匹配的姿势
cv2.putText(frame, f"Pose: {best_pose} ({best_score}%)", (50, 100),
            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2, cv2.LINE_AA)
pip install pyttsx3
import pyttsx3

# 初始化语音引擎
engine = pyttsx3.init()

# 语音播报
def speak(text):
    engine.say(text)
    engine.runAndWait()
if best_pose == "warrior":
    if angles["left_knee"] < 85:
        speak("左膝盖需要再弯曲一点")
    if angles["right_knee"] < 85:
        speak("右膝盖需要再弯曲一点")
cap_front = cv2.VideoCapture(0)  # 正面摄像头
cap_side = cv2.VideoCapture(1)  # 侧面摄像头（如果有）

while cap_front.isOpened() and cap_side.isOpened():
    ret1, frame_front = cap_front.read()
    ret2, frame_side = cap_side.read()

    if not ret1 or not ret2:
        break

    # 在这里对两个画面分别进行姿势检测...
fourcc = cv2.VideoWriter_fourcc(*'XVID')
out = cv2.VideoWriter('yoga_practice.avi', fourcc, 20.0, (640, 480))

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    out.write(frame)  # 录制视频

    cv2.imshow('Yoga Pose Evaluation', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

out.release()  # 停止录制
cap.release()
cv2.destroyAllWindows()
import json
import time

log_data = {
    "time": time.strftime("%Y-%m-%d %H:%M:%S"),
    "pose": best_pose,
    "score": best_score
}

with open("yoga_report.json", "a") as f:
    json.dump(log_data, f)
    f.write("\n")
