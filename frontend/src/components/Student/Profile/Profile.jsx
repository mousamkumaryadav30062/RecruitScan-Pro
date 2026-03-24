import React, { useState } from 'react';
import PersonalDetails from './PersonalDetails';
import AddressDetails from './AddressDetails';
import ExtraDetails from './ExtraDetails';
import DocumentDetails from './DocumentDetails';
import Preview from './Preview';

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { name: 'Personal Details', component: PersonalDetails },
    { name: 'Address Details', component: AddressDetails },
    { name: 'Extra Details', component: ExtraDetails },
    { name: 'Documents', component: DocumentDetails },
    { name: 'Preview', component: Preview }
  ];

  const CurrentComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen flex bg-gray-50">
     

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
      

        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {steps[currentStep].name}
            </h2>

            {/* Current Step Component */}
            <CurrentComponent
              onNext={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
              onPrevious={() => setCurrentStep(Math.max(currentStep - 1, 0))}
              isFirst={currentStep === 0}
              isLast={currentStep === steps.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
