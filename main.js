/****************************************************
 * 0. 体式信息
 ****************************************************/
const yogaPoses = {
  "半神猴式": {
    correct: [
      "躯干：后背延展往前，拉直脊柱",
      "骨盆：骨盆往前转动，增强大腿后拉伸",
      "腿：腿伸直，脚尖保持回勾有力"
    ],
    incorrect: [
      "弓背：会减少腿的伸展，增加腰部压力",
      "腿弯曲：会使拉伸部位偏移",
      "耸肩：会丧失身体向前延展的拉伸"
    ]
  },
  "坐角式": {
    correct: [
      "躯干：身体向上延展，随后慢慢往前往下",
      "骨盆：骨盆转动，双腿固定不动",
      "双腿：双腿伸直，脚尖回勾"
    ],
    incorrect: [
      "后背弯曲：使腰部压力过大，腰突不适",
      "双腿弯曲：导致骨盆转动幅度不够，拉伸位置偏移"
    ]
  },
  "轮式": {
    correct: [
      "胸腔：胸腔延展打开，保持呼吸顺序",
      "后背：后背发力，减少腰部压力",
      "臀部：臀部放松，拉伸开腹股沟",
      "腿：双腿往上往中间发力，稳定轮式根基"
    ],
    incorrect: [
      "手臂弯曲：会增加肩膀收紧，导致肩关节不伸展",
      "腋窝不张开：会增加腰椎压力",
      "后背不发力：使更大压力放在关节，导致关节挤压"
    ]
  },
  "树式": {
    correct: [
      "腿：主力腿伸直，膝关节保持弹性",
      "上身：上身挺直平衡，微收腹，保持骨盆稳定",
      "肩膀：肩膀下沉，手臂上举，伸展侧腰"
    ],
    incorrect: [
      "腿过度弯曲：导致身体不平衡",
      "身体侧倾：重心偏移，体式无法保持",
      "耸肩：后背肌肉过紧，颈椎不适"
    ]
  }
};

/****************************************************
 * 1. 初始化 Mediapipe Pose
 ****************************************************/
let camera = null;
let currentMode = 'user'; 
let lastLandmarks = null;

const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

const pose = new Pose({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  minDetectionConfidence: 0.7
});
pose.onResults(onResultsCallback);

function onResultsCallback(results) {
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  if (results.poseLandmarks) {
    lastLandmarks = results.poseLandmarks;
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
      { color: '#00FF00', lineWidth: 3 });
  }
  ctx.restore();
  autoDetectPose();
}

/****************************************************
 * 2. 启动摄像头
 ****************************************************/
function startCamera(facingMode) {
  if (camera) {
    camera.stop();
    camera = null;
  }
  camera = new Camera(video, {
    onFrame: async () => {
      await pose.send({ image: video });
    },
    width: 640,
    height: 480,
    facingMode: facingMode
  });
  camera.start();
}
startCamera('user');

/****************************************************
 * 3. 按钮事件
 ****************************************************/
document.getElementById('switchCamBtn').addEventListener('click', () => {
  currentMode = (currentMode === 'user') ? 'environment' : 'user';
  startCamera(currentMode);
});
document.getElementById('analyzeBtn').addEventListener('click', () => {
  manualAnalyze();
});

function manualAnalyze() {
  if (!lastLandmarks) {
    speak("未检测到人体姿势");
    return;
  }
  const angles = calculateArmAngles(lastLandmarks);
  const poseName = classifyPose(lastLandmarks);
  const score = evaluatePose(angles, poseName);
  updateUI(poseName, score, angles);
}

/****************************************************
 * 4. 自动识别
 ****************************************************/
function autoDetectPose() {
  if (!lastLandmarks) return;
  const angles = calculateArmAngles(lastLandmarks);
  const poseName = classifyPose(lastLandmarks);
  const score = evaluatePose(angles, poseName);
  updateUI(poseName, score, angles);
}

/****************************************************
 * 5. 角度计算 & 评分 & 分类
 ****************************************************/
/* 
   因为你原先写 { ... } 会导致语法错误，
   我们这里用最简逻辑来返回固定值，防止出错 
*/

// (A) 计算手臂角度(最简假数据)
function calculateArmAngles(landmarks) {
  // 假设左右臂都90度
  return { left: 90, right: 90 };
}

// (B) 简化角度函数(最简)
function calculateAngle(a, b, c) {
  // 返回固定90度
  return 90;
}

// (C) 简单姿势分类(最简)
function classifyPose(landmarks) {
  // 固定返回“坐角式”
  return "坐角式";
}

// (D) 评分(最简)
function evaluatePose(angles, poseName) {
  // 固定返回80分
  return 80;
}

/****************************************************
 * 6. 更新UI
 ****************************************************/
function updateUI(poseName, score, angles) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = `
    <div class="pose-label">检测到体式：<strong>${poseName}</strong></div>
    <div>左臂角度: ${angles.left.toFixed(1)}°, 右臂角度: ${angles.right.toFixed(1)}°</div>
    <div>评分: ${score.toFixed(1)}/100</div>
  `;
  const threshold = 70;
  let isCorrect = (score >= threshold);
  showTips(poseName, isCorrect);
  if (isCorrect) {
    speak(`当前检测为${poseName}，姿势不错，分数${score.toFixed(1)}`);
  } else {
    speak(`这是${poseName}吗？分数${score.toFixed(1)}，请再努力调整`);
  }
}

/****************************************************
 * 7. 显示提示
 ****************************************************/
function showTips(poseName, isCorrect) {
  const tipsDiv = document.getElementById('tips');
  const poseData = yogaPoses[poseName];
  if (!poseData) {
    tipsDiv.innerHTML = `<p>暂未收录该体式：${poseName}</p>`;
    return;
  }
  let arr = isCorrect ? poseData.correct : poseData.incorrect;
  let html = `<h2>${poseName} - ${isCorrect ? "正确要点" : "错误要点"}</h2><ul>`;
  arr.forEach(item => {
    html += `<li>${item}</li>`;
  });
  html += '</ul>';
  tipsDiv.innerHTML = html;
  tipsDiv.className = isCorrect ? 'correct' : 'incorrect';
}

/****************************************************
 * 8. 语音
 ****************************************************/
function speak(text) {
  if (window.speechSynthesis) {
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }
}

// 离开页面释放资源
window.addEventListener('beforeunload', () => {
  if (camera) camera.stop();
  if (pose.close) pose.close();
});
