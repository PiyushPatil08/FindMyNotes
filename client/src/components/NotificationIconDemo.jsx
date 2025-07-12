import React from 'react';
import NotificationIcon, { NotificationIconWithHover, NotificationIconWithBadge } from './NotificationIcon';

const NotificationIconDemo = () => {
  const notificationTypes = [
    { type: 'message', label: 'Message' },
    { type: 'comment', label: 'Comment' },
    { type: 'like', label: 'Like' },
    { type: 'upload', label: 'Upload' },
    { type: 'follow', label: 'Follow' },
    { type: 'notification', label: 'General' }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Icons</h2>
      
      {/* Basic Icons */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Basic Icons</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {notificationTypes.map(({ type, label }) => (
            <div key={type} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <NotificationIcon type={type} className="w-8 h-8 mb-2" />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Variants */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Size Variants</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['small', 'default', 'large', 'xlarge'].map((size) => (
            <div key={size} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <NotificationIcon type="message" size={size} className="mb-2" />
              <span className="text-sm text-gray-600 capitalize">{size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Color Variants */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Color Variants</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { color: 'text-gray-600', label: 'Default' },
            { color: 'text-blue-600', label: 'Blue' },
            { color: 'text-green-600', label: 'Green' },
            { color: 'text-red-600', label: 'Red' }
          ].map(({ color, label }) => (
            <div key={color} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <NotificationIcon type="like" color={color} className="w-8 h-8 mb-2" />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Icons with Badge */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Icons with Badge</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 5, 99].map((count) => (
            <div key={count} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <NotificationIconWithBadge 
                type="notification" 
                unreadCount={count}
                className="w-8 h-8 mb-2" 
              />
              <span className="text-sm text-gray-600">{count} notification{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover Effects */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Hover Effects</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {notificationTypes.slice(0, 3).map(({ type, label }) => (
            <div key={type} className="flex flex-col items-center p-4 border border-gray-200 rounded-lg">
              <NotificationIconWithHover 
                type={type} 
                className="w-8 h-8 mb-2" 
                hoverColor="text-blue-600"
              />
              <span className="text-sm text-gray-600">{label} (hover me)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Usage Examples</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`// Basic usage
<NotificationIcon type="message" />

// With custom size and color
<NotificationIcon type="like" size="large" color="text-red-600" />

// With badge for unread count
<NotificationIconWithBadge type="notification" unreadCount={5} />

// With hover effects
<NotificationIconWithHover type="comment" hoverColor="text-blue-600" />`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default NotificationIconDemo; 