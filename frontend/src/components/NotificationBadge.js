import React from 'react';

const NotificationBadge = ({ count }) => {
  if (!count || count === 0) return null;
  return (
    <span style={{
      background: '#e74c3c',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '12px',
      marginLeft: '5px',
      color: 'white',
      fontWeight: 'bold'
    }}>
      {count}
    </span>
  );
};

export default NotificationBadge;