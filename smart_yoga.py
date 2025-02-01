import cv2
import mediapipe as mp
import numpy as np
import pyttsx3
import json
import time
import threading

# -------------------------------
# 初始化部分
# -------------------------------

# 初始化 MediaPipe 姿势检测
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()
mp_drawing = mp.solutions.drawing_utils

# 初始化语音引擎
engine = pyttsx3.init()

# -------------------------------
# 辅助函数
# -------------------------------

def speak(text):
    """语音播报（同步调用）"""
    engine.say(text)
    engine.runAndWait()

def speak_async(text):
    """异步语音播报，防止阻塞主线程"""
    threading.Thread(target=speak, args=(text,)).start()

def calculate_angle(a, b, c):
    """
    计算由点 a, b, c 构成的角度（以 b 为顶点），单位为度
    并对除零情况进行处理
    """
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)
    if norm_ba == 0 or norm_bc == 0:
        return 0.0
    cosine_angle = np.dot(ba, bc) / (norm_ba * norm_bc)
    angle = np.arccos(np.clip(cosine_angle, -1.0, 1.0))
    return np.degrees(angle)

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

def process_frame(frame):
    """
    处理单帧图像：
    - 将图像转换为 RGB 并进行姿势检测
    - 计算各关键关节的角度
    - 根据预设标准计算最佳匹配姿势及得分
    - 绘制骨架和标注文本
    返回处理后的图像、最佳姿势和得分
    """
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(rgb_frame)
    
    best_pose = "Unknown"
    best_score = 0

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark

        def get_landmark_point(landmark):
            return [landmarks[landmark].x, landmarks[landmark].y]

        # 获取正面关键点坐标
        shoulder_l, elbow_l, wrist_l = map(get_landmark_point, [
            mp_pose.PoseLandmark.LEFT_SHOULDER, 
            mp_pose.PoseLandmark.LEFT_ELBOW, 
            mp_pose.PoseLandmark.LEFT_WRIST
        ])
        shoulder_r, elbow_r, wrist_r = map(get_landmark_point, [
            mp_pose.PoseLandmark.RIGHT_SHOULDER, 
            mp_pose.PoseLandmark.RIGHT_ELBOW, 
            mp_pose.PoseLandmark.RIGHT_WRIST
        ])
        hip_l, knee_l, ankle_l = map(get_landmark_point, [
            mp_pose.PoseLandmark.LEFT_HIP, 
            mp_pose.PoseLandmark.LEFT_KNEE, 
            mp_pose.PoseLandmark.LEFT_ANKLE
        ])
        hip_r, knee_r, ankle_r = map(get_landmark_point, [
            mp_pose.PoseLandmark.RIGHT_HIP, 
            mp_pose.PoseLandmark.RIGHT_KNEE, 
            mp_pose.PoseLandmark.RIGHT_ANKLE
        ])

        # 计算角度
        angles = {
            "left_elbow": calculate_angle(shoulder_l, elbow_l, wrist_l),
            "right_elbow": calculate_angle(shoulder_r, elbow_r, wrist_r),
            "left_knee": calculate_angle(hip_l, knee_l, ankle_l),
            "right_knee": calculate_angle(hip_r, knee_r, ankle_r)
        }

        # 遍历预设姿势，计算匹配得分
        for pose_name, angles_dict in POSES.items():
            scores = [
                max(0, 100 - abs(standard_angle - angles.get(joint, 0)))
                for joint, standard_angle in angles_dict.items()
            ]
            pose_score = int(np.mean(scores)) if scores else 0
            if pose_score > best_score:
                best_score = pose_score
                best_pose = pose_name

        # 语音实时提醒（以战士式为例）
        if best_pose == "warrior":
            if angles.get("left_knee", 0) < 85:
                speak_async("左膝盖需要再弯曲一点")
            if angles.get("right_knee", 0) < 85:
                speak_async("右膝盖需要再弯曲一点")

        # 绘制骨架
        mp_drawing.draw_landmarks(frame, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # 在画面上标注姿势及得分
        cv2.putText(frame, f"Pose: {best_pose} ({best_score}%)", (50, 100),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        cv2.putText(frame, f"Score: {best_score}%", (50, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    
    return frame, best_pose, best_score

# -------------------------------
# 主流程
# -------------------------------

def main():
    # 打开正面摄像头（设备号 0）
    cap_front = cv2.VideoCapture(0)
    
    # 尝试打开侧面摄像头（设备号 1）
    cap_side = cv2.VideoCapture(1)
    if not cap_side.isOpened():
        cap_side = None

    # 设置视频录制参数
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    # 这里录制的分辨率以正面摄像头为基准
    out = cv2.VideoWriter('yoga_practice.avi', fourcc, 20.0, (640, 480))
    
    # 保存最后一次检测到的姿势和得分（用于日志记录）
    last_pose = "Unknown"
    last_score = 0

    while cap_front.isOpened():
        ret, frame_front = cap_front.read()
        if not ret:
            break
        
        # 处理正面摄像头画面
        annotated_front, best_pose, best_score = process_frame(frame_front)
        last_pose, last_score = best_pose, best_score
        
        # 如果侧面摄像头可用，则处理侧面画面并合并显示
        if cap_side:
            ret_side, frame_side = cap_side.read()
            if ret_side:
                annotated_side, _, _ = process_frame(frame_side)
                # 调整侧面画面大小与正面一致后横向拼接
                annotated_side = cv2.resize(annotated_side, (annotated_front.shape[1], annotated_front.shape[0]))
                combined_frame = np.hstack((annotated_front, annotated_side))
            else:
                combined_frame = annotated_front
        else:
            combined_frame = annotated_front
        
        # 将结果写入视频文件
        out.write(combined_frame)
        
        # 显示检测结果
        cv2.imshow('Yoga Pose Evaluation', combined_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # 释放所有资源
    out.release()
    cap_front.release()
    if cap_side:
        cap_side.release()
    cv2.destroyAllWindows()
    
    # 记录日志数据到 JSON 文件
    log_data = {
        "time": time.strftime("%Y-%m-%d %H:%M:%S"),
        "pose": last_pose,
        "score": last_score
    }
    with open("yoga_report.json", "a") as f:
        json.dump(log_data, f)
        f.write("\n")

if __name__ == "__main__":
    main()
