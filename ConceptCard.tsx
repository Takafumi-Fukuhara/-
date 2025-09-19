
import React from 'react';
import type { IconName } from '../types';
import Icon from './Icon';

interface ConceptCardProps {
  title: string;
  description: string;
  iconName: IconName;
}

const ConceptCard: React.FC<ConceptCardProps> = ({ title, description, iconName }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 hover:border-cyan-500 hover:bg-gray-800 transition-all duration-300 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-gray-700 rounded-md mr-4">
          <Icon name={iconName} className="w-6 h-6 text-cyan-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-100">{title}</h3>
      </div>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
};

export default ConceptCard;
