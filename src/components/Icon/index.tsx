import React, { useState, useEffect } from "react";

const DynamicIcon = ({ iconName, ...props }: any) => {
  const [IconComponent, setIconComponent] = useState<any>(null);

  useEffect(() => {
    const loadIcon = async () => {
      try {
        const { [iconName]: Icon }: any = await import("@ant-design/icons");
        setIconComponent(() => Icon);
      } catch (error) {
        console.error(`Icon ${iconName} not found`);
      }
    };

    loadIcon();
  }, [iconName]);

  return IconComponent ? <IconComponent {...props} /> : null;
};

export default DynamicIcon;
