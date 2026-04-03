import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy (Security Test)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // مسح الذاكرة المخبئية لبيئة Node لضمان استقلالية كل اختبار
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // استعادة البيئة الأصلية بعد انتهاء الاختبارات
    process.env = originalEnv;
  });

  it('should throw a CRITICAL Error if JWT_SECRET is missing', () => {
    // محاكاة نسيان إضافة المتغير البيئي في الخادم
    delete process.env.JWT_SECRET;

    // 👈 تم تحديث النص هنا ليتطابق تماماً مع الكود الفعلي الخاص بك
    expect(() => new JwtStrategy()).toThrow(
      'CRITICAL: JWT_SECRET environment variable is not defined!'
    );
  });

  it('should instantiate successfully if JWT_SECRET is provided', () => {
    // محاكاة وجود المتغير البيئي بشكل صحيح
    process.env.JWT_SECRET = 'secure_test_secret_key_123';
    
    const strategy = new JwtStrategy();
    expect(strategy).toBeDefined();
  });
});