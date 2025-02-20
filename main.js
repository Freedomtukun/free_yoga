// main.js

// 定义20个瑜伽单体及其关键点检测条件（简化为示例，实际需要精确数据）
const poses = {
  "Tadasana": { name: "山式", description: "站立，双脚并拢，双手自然下垂。" },
  "Uttanasana": { name: "前屈式", description: "身体前屈，双手靠近地面。" },
  "AdhoMukhaSvanasana": { name: "下犬式", description: "臀部向上，手脚撑地呈倒V形。" },
  "Utkatasana": { name: "椅式", description: "膝盖弯曲，双手向上举起。" },
  "Chaturanga": { name: "四柱支撑", description: "身体平行地面，肘部弯曲90度。" },
  "UrdhvaMukhaSvanasana": { name: "上犬式", description: "胸部向上，腿伸直，手撑地。" },
  "VirabhadrasanaI": { name: "战士一式", description: "一腿前屈，双手上举，后腿伸直。" },
  "VirabhadrasanaII": { name: "战士二式", description: "双腿分开，双手水平伸展。" },
  "Trikonasana": { name: "三角式", description: "一手触地，另一手向上，腿伸直。" },
  "Vrikshasana": { name: "树式", description: "单腿站立，另一脚靠在腿上，双手合十。" },
  "Plank": { name: "平板支撑", description: "身体成直线，手撑地。" },
  "Balasana": { name: "婴儿式", description: "臀部坐脚跟，前额触地，双手向前。" },
  "Savasana": { name: "仰尸式", description: "平躺，双手自然放两侧。" },
  "Bhujangasana": { name: "眼镜蛇式", description: "胸部向上，腿伸直，手撑地。" },
  "Dandasana": { name: "杖式", description: "坐姿，双腿伸直，双手撑地。" },
  "Paschimottanasana": { name: "坐姿前屈", description: "坐姿，身体前屈，双手触脚。" },
  "ArdhaMatsyendrasana": { name: "半脊柱扭转", description: "坐姿，身体扭转，一手撑地。" },
  "Garudasana": { name: "鹰式", description: "单腿站立，双手双腿交叉。" },
  "Natarajasana": { name: "舞王式", description: "单腿站立，一手抓脚向后拉。" },
  "SetuBandhasana": { name: "桥式", description: "仰卧，臀部抬起，双手放身侧。" },
};

// 定义拜日序列A和B
const sequences = {
  "A": [
    "Tadasana", "Uttanasana", "Plank", "Chaturanga", 
    "UrdhvaMukhaSvanasana", "AdhoMukhaSvanasana", "Uttanasana", "Tadasana"
  ],
  "B": [
    "Tadasana", "Utkatasana", "Uttanasana", "Plank", "Chaturanga", 
    "UrdhvaMukhaSvanasana", "AdhoMukhaSvanasana", "VirabhadrasanaI", "Tadasana"
  ],
};

// 全局变量
let camera = null;
let pose = null;
let currentMode = 'single'; // 'single', 'sequenceA', 'sequenceB'
let currentSequence = [];
let sequenceIndex = 0;
let facingMode = 'user'; // 'user' 或 'environment'
let isPaused = false; // 暂停状态
let lastDetectedPose = null; // 上次检测到的体式
const statusElement = document.getElementById('status');

// 初始化MediaPipe Pose
function initPose() {
  pose = new Pose({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.3/${file}`
  });
  pose.setOptions({
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  pose.onResults(onResults);
}

// 启动摄像头
function startCamera() {
  const videoElement = document.getElementById('video');
  camera = new Camera(videoElement, {
    onFrame: async () => {
      if (!isPaused) await pose.send({ image: videoElement });
    },
    width: 640,
    height: 480,
    facingMode: facingMode
  });
  camera.start();
}

// 处理检测结果
function onResults(results) {
  const canvasElement = document.getElementById('canvas');
  const canvasCtx = canvasElement.getContext('2d');
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (!isPaused) {
    // 未暂停时，执行检测逻辑
    if (results.poseLandmarks) {
      drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
      drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });

      const detectedPose = detectPose(results.poseLandmarks);
      lastDetectedPose = detectedPose;

      if (currentMode === 'single') {
        statusElement.innerText = detectedPose ? poses[detectedPose].name : '未检测到体式';
      } else if (currentMode.startsWith('sequence')) {
        const expectedPose = currentSequence[sequenceIndex];
        statusElement.innerText = `当前目标: ${poses[expectedPose].name}`;
        if (detectedPose === expectedPose) {
          speak(`完成 ${poses[expectedPose].name}`);
          sequenceIndex++;
          if (sequenceIndex >= currentSequence.length) {
            speak('序列完成');
            currentMode = 'single';
            sequenceIndex = 0;
            statusElement.innerText = '序列已完成，返回单体检测';
          }
        }
      }
    } else {
      statusElement.innerText = '未检测到人体';
    }
  } else {
    // 暂停时，显示暂停状态
    statusElement.innerText = '已暂停';
  }
}

// 简化的体式检测函数（实际需根据关键点坐标精确实现）
function detectPose(landmarks) {
  // 示例逻辑：根据肩膀、臀部、膝盖等关键点位置判断体式
  const leftShoulder = landmarks[11];
  const rightShoulder = landmarks[12];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const leftKnee = landmarks[25];
  const rightKnee = landmarks[26];

  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return null;

  // 山式：站立，肩膀和臀部垂直对齐
  if (Math.abs(leftShoulder.y - rightShoulder.y) < 0.05 && Math.abs(leftHip.y - rightHip.y) < 0.05) {
    return "Tadasana";
  }
  // 下犬式：臀部高于肩膀和膝盖
  if (leftHip.y < leftShoulder.y && leftHip.y < leftKnee.y) {
    return "AdhoMukhaSvanasana";
  }
  // 前屈式：肩膀接近膝盖
  if (leftShoulder.y > leftHip.y && Math.abs(leftShoulder.y - leftKnee.y) < 0.2) {
    return "Uttanasana";
  }
  // 其他体式检测需类似补充完整逻辑
  return null; // 未匹配则返回null
}

// 语音提示
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  speechSynthesis.speak(utterance);
}

// 按钮事件
document.getElementById('singleDetect').addEventListener('click', () => {
  currentMode = 'single';
  sequenceIndex = 0;
  isPaused = false;
  speak('进入单体检测模式');
  statusElement.innerText = '单体检测模式';
});

document.getElementById('sequenceA').addEventListener('click', () => {
  currentMode = 'sequenceA';
  currentSequence = sequences['A'];
  sequenceIndex = 0;
  isPaused = false;
  speak('开始拜日A序列');
  statusElement.innerText = `当前目标: ${poses[currentSequence[0]].name}`;
});

document.getElementById('sequenceB').addEventListener('click', () => {
  currentMode = 'sequenceB';
  currentSequence = sequences['B'];
  sequenceIndex = 0;
  isPaused = false;
  speak('开始拜日B序列');
  statusElement.innerText = `当前目标: ${poses[currentSequence[0]].name}`;
});

document.getElementById('pause').addEventListener('click', () => {
  isPaused = !isPaused; // 切换暂停状态
  speak(isPaused ? '已暂停' : '继续检测'); // 语音提示
  if (isPaused) {
    statusElement.innerText = '已暂停';
  } else {
    if (currentMode === 'single') {
      statusElement.innerText = '单体检测模式';
    } else {
      statusElement.innerText = `当前目标: ${poses[currentSequence[sequenceIndex]].name}`;
    }
  }
});

document.getElementById('stop').addEventListener('click', () => {
  currentMode = 'single';
  sequenceIndex = 0;
  isPaused = false;
  speak('停止序列，回到单体检测');
  statusElement.innerText = '单体检测模式';
});

document.getElementById('switchCamera').addEventListener('click', () => {
  facingMode = facingMode === 'user' ? 'environment' : 'user';
  camera.stop();
  startCamera();
  speak(`切换至${facingMode === 'user' ? '前置' : '后置'}摄像头`);
});

// 初始化
initPose();
startCamera();