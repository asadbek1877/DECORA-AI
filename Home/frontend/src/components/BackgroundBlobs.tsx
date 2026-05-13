import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, LinearGradient, Stop, Ellipse } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export const BackgroundBlobs = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          {/* Main blob gradient - light blue translucent */}
          <RadialGradient id="blob1" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#B8E2FF" stopOpacity="0.7" />
            <Stop offset="60%" stopColor="#A0D8FF" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#80CBFF" stopOpacity="0.0" />
          </RadialGradient>
          <RadialGradient id="blob2" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#C8EAFF" stopOpacity="0.65" />
            <Stop offset="50%" stopColor="#A8DEFF" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#90D4FF" stopOpacity="0.0" />
          </RadialGradient>
          <RadialGradient id="blob3" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#D0EFFF" stopOpacity="0.6" />
            <Stop offset="70%" stopColor="#B0E0FF" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#90D4FF" stopOpacity="0.0" />
          </RadialGradient>
          <LinearGradient id="blobEdge" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="#B8E2FF" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Large top-right blob */}
        <Path
          d={`M ${width * 0.4} ${-height * 0.05}
              C ${width * 1.0} ${-height * 0.02} ${width * 1.3} ${height * 0.15} ${width * 1.1} ${height * 0.35}
              C ${width * 0.9} ${height * 0.55} ${width * 0.3} ${height * 0.45} ${width * 0.15} ${height * 0.25}
              C ${width * 0.0} ${height * 0.05} ${width * 0.15} ${-height * 0.05} ${width * 0.4} ${-height * 0.05} Z`}
          fill="url(#blob1)"
        />

        {/* Large bottom-left flowing blob */}
        <Path
          d={`M ${-width * 0.2} ${height * 0.5}
              C ${width * 0.1} ${height * 0.4} ${width * 0.5} ${height * 0.55} ${width * 0.7} ${height * 0.7}
              C ${width * 0.9} ${height * 0.85} ${width * 0.6} ${height * 1.05} ${width * 0.2} ${height * 1.0}
              C ${-width * 0.1} ${height * 0.95} ${-width * 0.3} ${height * 0.65} ${-width * 0.2} ${height * 0.5} Z`}
          fill="url(#blob2)"
        />

        {/* Center connecting blob - liquid glass ribbon */}
        <Path
          d={`M ${width * 0.6} ${height * 0.2}
              C ${width * 0.9} ${height * 0.3} ${width * 1.0} ${height * 0.5} ${width * 0.8} ${height * 0.65}
              C ${width * 0.6} ${height * 0.8} ${width * 0.2} ${height * 0.75} ${width * 0.1} ${height * 0.6}
              C ${width * 0.0} ${height * 0.45} ${width * 0.3} ${height * 0.15} ${width * 0.6} ${height * 0.2} Z`}
          fill="url(#blob3)"
        />

        {/* Small accent blob top-left */}
        <Ellipse
          cx={width * 0.1}
          cy={height * 0.12}
          rx={width * 0.25}
          ry={height * 0.08}
          fill="url(#blob1)"
          opacity={0.4}
        />

        {/* Edge highlights for glass effect */}
        <Path
          d={`M ${width * 0.55} ${height * 0.25}
              C ${width * 0.75} ${height * 0.2} ${width * 0.85} ${height * 0.3} ${width * 0.8} ${height * 0.4}
              C ${width * 0.75} ${height * 0.35} ${width * 0.65} ${height * 0.3} ${width * 0.55} ${height * 0.25} Z`}
          fill="url(#blobEdge)"
        />
      </Svg>
    </View>
  );
};
