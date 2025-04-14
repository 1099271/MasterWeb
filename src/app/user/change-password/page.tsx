'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserLayout from '@/components/user/UserLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { changePassword } from '@/lib/auth';
import { useTranslation } from '@/utils/useTranslation';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.old_password) {
      newErrors.old_password = t('form.validation.required', { field: t('form.fields.password') });
    }
    
    if (!formData.new_password) {
      newErrors.new_password = t('form.validation.required', { field: t('form.fields.password') });
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = t('messages.error.passwordComplexity');
    }
    
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = t('messages.error.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await changePassword({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      
      setSuccess(t('messages.success.passwordChanged'));
      setFormData({
        old_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error: any) {
      if (error.message.includes('incorrect password')) {
        setErrors({
          old_password: t('messages.error.incorrectPassword'),
        });
      } else {
        setErrors({
          general: t('messages.error.general'),
        });
      }
      console.error('Change password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <UserLayout>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">修改密码</h1>
          
          <div className="max-w-md mx-auto">
            {success ? (
              <div className="rounded-md bg-green-50 p-4 mb-4">
                <div className="text-sm text-green-700">
                  {success}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">
                      {errors.general}
                    </div>
                  </div>
                )}
                
                <Input
                  label="当前密码"
                  id="old_password"
                  name="old_password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.old_password}
                  onChange={handleChange}
                  error={errors.old_password}
                />
                
                <Input
                  label="新密码"
                  id="new_password"
                  name="new_password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  error={errors.new_password}
                />
                
                <Input
                  label="确认新密码"
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  error={errors.confirm_password}
                />
                
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    修改密码
                  </Button>
                </div>
              </form>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-2">密码安全提示</h2>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>密码长度至少为8个字符</li>
                <li>建议使用字母、数字和特殊字符的组合</li>
                <li>避免使用容易猜测的个人信息，如生日、姓名等</li>
                <li>定期更换密码可以提高账户安全性</li>
                <li>请勿将密码告知他人或在不安全的环境中输入密码</li>
              </ul>
            </div>
          </div>
        </div>
      </UserLayout>
    </ProtectedRoute>
  );
} 