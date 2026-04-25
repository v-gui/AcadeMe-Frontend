import React from 'react';

interface Props {
    children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => {
    return (
        
        <div className="min-h-screen w-full bg-[#F0F2F5] flex flex-col overflow-x-hidden">
            
            
            <div className="w-full flex flex-col flex-1 px-4 md:px-12 lg:px-16">
                {children}
            </div>

        </div>
    );
};

export default MainLayout;