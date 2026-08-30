import React from 'react';
import { SkeletonScreen, SkeletonVariant } from './SkeletonScreen';

interface ComponentLoaderProps {
  label?: string;
  variant?: SkeletonVariant;
}

export const ComponentLoader: React.FC<ComponentLoaderProps> = ({ 
  label = 'Carregando módulo...',
  variant = 'generic'
}) => {
  return <SkeletonScreen variant={variant} label={label} />;
};

export { SkeletonScreen };
export type { SkeletonVariant };
