# SmartYoga API 文档

## 基础信息

- 基础URL: `/api`
- 请求/响应格式: JSON
- 认证: JWT令牌, 通过`Authorization`头部传递 (`Bearer <token>`)

## 认证相关

### 注册用户

- 请求: `POST /users/register`
- 请求体:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- 响应:
  ```json
  {
    "status": "success",
    "token": "string",
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "yogaLevel": "string",
      "createdAt": "string"
    }
  }
  ```

### 登录

- 请求: `POST /users/login`
- 请求体:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- 响应:
  ```json
  {
    "status": "success",
    "token": "string",
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "yogaLevel": "string",
      "createdAt": "string"
    }
  }
  ```

### 获取当前用户

- 请求: `GET /users/me`
- 认证: 必需
- 响应:
  ```json
  {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "yogaLevel": "string",
    "createdAt": "string"
  }
  ```

### 更新用户资料

- 请求: `PUT /users/me`
- 认证: 必需
- 请求体:
  ```json
  {
    "username": "string", // 可选
    "email": "string", // 可选
    "yogaLevel": "string" // 可选
  }
  ```
- 响应:
  ```json
  {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "yogaLevel": "string",
    "createdAt": "string"
  }
  ```

## 瑜伽姿势相关

### 获取所有姿势

- 请求: `GET /poses`
- 查询参数:
  - `difficulty`: 过滤难度 (beginner, intermediate, advanced)
  - `category`: 过滤类别 (standing, seated, balancing, etc)
- 响应:
  ```json
  [
    {
      "_id": "string",
      "name": "string",
      "englishName": "string",
      "description": "string",
      "difficulty": "string",
      "category": "string",
      "benefits": ["string"],
      "imageUrl": "string",
      "createdAt": "string"
    }
  ]
  ```

### 获取单个姿势

- 请求: `GET /poses/:id`
- 响应:
  ```json
  {
    "_id": "string",
    "name": "string",
    "englishName": "string",
    "description": "string",
    "difficulty": "string",
    "category": "string",
    "keypoints": {},
    "benefits": ["string"],
    "imageUrl": "string",
    "createdAt": "string"
  }
  ```

### 分析姿势

- 请求: `POST /poses/analyze`
- 请求体:
  ```json
  {
    "poseId": "string",
    "keypoints": {
      "nose": { "x": 0.5, "y": 0.5, "score": 0.9 },
      // 其他关键点
    },
    "duration": 30 // 可选
  }
  ```
- 响应:
  ```json
  {
    "poseName": "string",
    "accuracy": 87.5,
    "feedback": ["string"]
  }
  ```

### 获取用户姿势历史记录

- 请求: `GET /poses/user/history`
- 认证: 必需
- 响应:
  ```json
  [
    {
      "_id": "string",
      "pose": {
        "_id": "string",
        "name": "string",
        "englishName": "string",
        "category": "string"
      },
      "accuracy": 87.5,
      "duration": 45,
      "feedback": ["string"],
      "date": "string"
    }
  ]
  ```

## 瑜伽序列相关

### 获取所有序列

- 请求: `GET /sequences`
- 查询参数:
  - `difficulty`: 过滤难度 (beginner, intermediate, advanced)
  - `category`: 过滤类别 (morning, evening, energizing, etc)
- 响应:
  ```json
  [
    {
      "_id": "string",
      "name": "string",
      "description": "string",
      "difficulty": "string",
      "category": "string",
      "poses": [
        {
          "pose": {
            "_id": "string",
            "name": "string",
            "englishName": "string",
            "imageUrl": "string"
          },
          "duration": 30,
          "order": 1
        }
      ],
      "totalDuration": 180,
      "createdBy": {
        "_id": "string",
        "username": "string"
      },
      "isPublic": true,
      "createdAt": "string"
    }
  ]
  ```

### 获取单个序列

- 请求: `GET /sequences/:id`
- 响应:
  ```json
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "difficulty": "string",
    "category": "string",
    "poses": [
      {
        "pose": {
          "_id": "string",
          "name": "string",
          "englishName": "string",
          "description": "string",
          "imageUrl": "string",
          "keypoints": {}
        },
        "duration": 30,
        "order": 1,
        "transitionHint": "string"
      }
    ],
    "totalDuration": 180,
    "createdBy": {
      "_id": "string",
      "username": "string"
    },
    "isPublic": true,
    "createdAt": "string"
  }
  ```

### 分析序列中的姿势

- 请求: `POST /sequences/:id/analyze`
- 请求体:
  ```json
  {
    "keypoints": {
      "nose": { "x": 0.5, "y": 0.5, "score": 0.9 },
      // 其他关键点
    },
    "poseIndex": 0
  }
  ```
- 响应:
  ```json
  {
    "poseId": "string",
    "poseName": "string",
    "currentIndex": 0,
    "totalPoses": 5,
    "duration": 30,
    "accuracy": 87.5,
    "feedback": ["string"],
    "isLastPose": false,
    "nextPose": {
      "name": "string",
      "transitionHint": "string"
    }
  }
  ```

### 完成序列训练

- 请求: `POST /sequences/:id/complete`
- 请求体:
  ```json
  {
    "poseRecords": [
      {
        "poseId": "string",
        "accuracy": 87.5,
        "feedback": ["string"],
        "duration": 30
      }
    ]
  }
  ```
- 响应:
  ```json
  {
    "completed": true,
    "averageAccuracy": 85.6,
    "completedPoses": 5,
    "feedback": ["string"]
  }
  ```

### 创建序列

- 请求: `POST /sequences`
- 认证: 必需
- 请求体:
  ```json
  {
    "name": "string",
    "description": "string",
    "difficulty": "string",
    "category": "string",
    "poses": [
      {
        "pose": "string", // poseId
        "duration": 30,
        "order": 1,
        "transitionHint": "string"
      }
    ],
    "isPublic": true
  }
  ```
- 响应: 创建的序列对象

### 更新序列

- 请求: `PUT /sequences/:id`
- 认证: 必需
- 请求体: 同创建序列
- 响应: 更新后的序列对象

### 删除序列

- 请求: `DELETE /sequences/:id`
- 认证: 必需
- 响应:
  ```json
  {
    "message": "序列已删除"
  }
  ```