import { render, screen, act } from '@testing-library/react';
import FreeTraining from '../src/components/TrainingModes/FreeTraining';
import { TrainingProvider } from '../src/contexts/TrainingContext';

// 模拟 TrainingContext
jest.mock('../src/contexts/TrainingContext', () => {
  const originalModule = jest.requireActual('../src/contexts/TrainingContext');
  
  return {
    ...originalModule,
    useTraining: () => ({
      setWebcam: jest.fn(),
      startDetection: jest.fn(),
      stopDetection: jest.fn(),
      keypoints: null,
      isDetecting: false,
      error: null
    })
  };
});

// 模拟 webcam
jest.mock('react-webcam', () => {
  return function DummyWebcam() {
    return <div data-testid="mock-webcam"></div>;
  };
});

// 模拟 API 服务
jest.mock('../src/services/poseService', () => ({
  getAllPoses: jest.fn().mockResolvedValue([
    {
      _id: '1',
      name: '山式',
      englishName: 'Mountain Pose',
      difficulty: 'beginner',
      category: 'standing'
    },
    {
      _id: '2',
      name: '战士一式',
      englishName: 'Warrior I',
      difficulty: 'intermediate',
      category: 'standing'
    }
  ]),
  analyzePose: jest.fn().mockResolvedValue({
    accuracy: 85,
    feedback: ['很好！保持这个姿势。']
  })
}));

describe('PoseDetector', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <TrainingProvider>
          <FreeTraining />
        </TrainingProvider>
      );
    });
    
    // 验证组件是否渲染
    expect(screen.getByTestId('mock-webcam')).toBeInTheDocument();
  });

  // 添加更多测试用例
});