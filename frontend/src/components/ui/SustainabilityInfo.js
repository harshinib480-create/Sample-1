import React from 'react';
import { Leaf, Recycle, Zap, Award, TreePine } from 'lucide-react';

const SustainabilityInfo = ({ sustainability }) => {
  if (!sustainability) return null;

  const { is_recycled, is_low_carbon, is_energy_efficient, co2_savings_kg, certifications } = sustainability;

  const hasAnySustainability = is_recycled || is_low_carbon || is_energy_efficient;

  if (!hasAnySustainability && !co2_savings_kg && (!certifications || certifications.length === 0)) {
    return null;
  }

  return (
    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200" data-testid="sustainability-info">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-2 bg-green-600 rounded-lg">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Sustainability Impact</h3>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {is_recycled && (
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
            <Recycle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Recycled Material</p>
              <p className="text-xs text-gray-600">Made from recycled content</p>
            </div>
          </div>
        )}

        {is_low_carbon && (
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
            <TreePine className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Low Carbon</p>
              <p className="text-xs text-gray-600">Reduced CO₂ production</p>
            </div>
          </div>
        )}

        {is_energy_efficient && (
          <div className="flex items-center space-x-3 bg-white rounded-lg p-3">
            <Zap className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Energy Efficient</p>
              <p className="text-xs text-gray-600">Saves energy in use</p>
            </div>
          </div>
        )}
      </div>

      {/* CO2 Savings */}
      {co2_savings_kg && co2_savings_kg > 0 && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Your environmental impact</p>
              <p className="text-3xl font-bold mt-1">{co2_savings_kg} kg CO₂</p>
              <p className="text-sm opacity-90 mt-1">saved compared to conventional alternatives</p>
            </div>
            <Leaf className="h-16 w-16 opacity-30" />
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Award className="h-5 w-5 text-green-600" />
            <p className="font-semibold text-gray-900">Certifications</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-gray-700"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SustainabilityInfo;