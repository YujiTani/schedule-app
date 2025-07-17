import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ローディングスピナーコンポーネント
 * 
 * @param props - ローディングスピナーのプロパティ
 * @param props.size - スピナーのサイズ（デフォルト値: 'md'）
 * @param props.className - 追加のCSSクラス（デフォルト値: ''）
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      />
    </div>
  );
};