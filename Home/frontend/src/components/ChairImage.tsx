import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Ellipse, G } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SIZE = width * 0.7;

export const ChairImage = () => {
  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} viewBox="0 0 400 400">
        <Defs>
          {/* Solid chrome gradient - metallic silver with blue reflections */}
          <LinearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#D8E8F0" stopOpacity="1" />
            <Stop offset="20%" stopColor="#C0D4E4" stopOpacity="1" />
            <Stop offset="45%" stopColor="#E8F0F5" stopOpacity="1" />
            <Stop offset="70%" stopColor="#A8C4D8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#C8DCE8" stopOpacity="1" />
          </LinearGradient>
          {/* Bright highlight */}
          <LinearGradient id="highlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="40%" stopColor="#E8F4FA" stopOpacity="0.85" />
            <Stop offset="100%" stopColor="#B8D8EC" stopOpacity="0.7" />
          </LinearGradient>
          {/* Shadow areas */}
          <LinearGradient id="shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#8FAFC8" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#6890A8" stopOpacity="0.6" />
          </LinearGradient>
          {/* Specular reflection streak */}
          <LinearGradient id="reflection" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
          </LinearGradient>
          {/* Base/pedestal gradient - darker chrome */}
          <LinearGradient id="base" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#A0A8B0" stopOpacity="1" />
            <Stop offset="50%" stopColor="#C8D0D8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#889098" stopOpacity="1" />
          </LinearGradient>
          {/* Dark edge gradient for depth */}
          <LinearGradient id="darkEdge" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#7898B0" stopOpacity="0.6" />
            <Stop offset="50%" stopColor="#A0C0D4" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7898B0" stopOpacity="0.6" />
          </LinearGradient>
        </Defs>

        {/* Floor shadow - more visible */}
        <Ellipse cx="200" cy="370" rx="110" ry="18" fill="#4A6070" opacity={0.15} />

        {/* Chair base / pedestal */}
        <G>
          <Path
            d="M140 340 Q200 355 260 340 L255 330 Q200 345 145 330 Z"
            fill="url(#base)"
          />
          <Path
            d="M185 330 L190 260 L210 260 L215 330 Z"
            fill="url(#chrome)"
            stroke="#A0B8C8"
            strokeWidth="1"
          />
        </G>

        {/* Chair seat - curved organic shape */}
        <G>
          <Path
            d="M100 250 
               C100 220 130 195 160 190 
               L240 190 
               C270 195 300 220 300 250 
               C300 270 280 280 260 275 
               L140 275 
               C120 280 100 270 100 250 Z"
            fill="url(#chrome)"
            stroke="#90B0C8"
            strokeWidth="1.5"
          />
          {/* Seat highlight */}
          <Path
            d="M120 245 
               C120 225 145 205 170 200 
               L240 200 
               C265 205 285 225 285 245 
               C285 255 270 260 255 258 
               L150 258 
               C135 260 120 255 120 245 Z"
            fill="url(#highlight)"
            opacity={0.8}
          />
          {/* Top reflection streak */}
          <Path
            d="M160 198 L230 198 C240 198 245 200 245 203 L165 203 C155 203 155 200 160 198 Z"
            fill="url(#reflection)"
          />
          {/* Bottom edge shadow */}
          <Path
            d="M140 270 C160 278 240 278 260 270 L258 275 C238 282 162 282 142 275 Z"
            fill="url(#darkEdge)"
          />
        </G>

        {/* Chair back - flowing wave shape */}
        <G>
          <Path
            d="M110 250 
               C95 220 85 170 90 130 
               C95 90 120 60 160 50 
               L240 50 
               C280 60 305 90 310 130 
               C315 170 305 220 290 250
               C280 235 275 210 278 180
               C280 150 270 110 245 80
               L155 80
               C130 110 120 150 122 180
               C125 210 120 235 110 250 Z"
            fill="url(#chrome)"
            stroke="#90B0C8"
            strokeWidth="1.5"
          />
          {/* Back inner surface */}
          <Path
            d="M125 240 
               C115 210 108 170 112 135 
               C116 100 135 75 165 65 
               L235 65 
               C265 75 284 100 288 135 
               C292 170 285 210 275 240
               C268 225 264 200 266 175
               C268 148 260 118 240 92
               L160 92
               C140 118 132 148 134 175
               C136 200 132 225 125 240 Z"
            fill="url(#highlight)"
            opacity={0.75}
          />
          {/* Top edge highlight - bright chrome reflection */}
          <Path
            d="M160 55 L240 55 C260 60 275 72 280 85 L120 85 C125 72 140 60 160 55 Z"
            fill="url(#reflection)"
            opacity={0.9}
          />
          {/* Vertical center reflection */}
          <Path
            d="M195 60 L205 60 L208 85 L192 85 Z"
            fill="#FFFFFF"
            opacity={0.5}
          />
        </G>

        {/* Armrest left */}
        <G>
          <Path
            d="M100 250 C85 245 80 235 85 220 L90 180 C92 170 100 165 110 168 L115 230 C115 240 110 250 100 250 Z"
            fill="url(#chrome)"
            stroke="#90B0C8"
            strokeWidth="1"
          />
          <Path
            d="M98 242 C90 240 88 233 90 222 L94 188 C95 180 100 177 106 178 L108 228 C108 236 104 244 98 242 Z"
            fill="url(#reflection)"
            opacity={0.6}
          />
        </G>

        {/* Armrest right */}
        <G>
          <Path
            d="M300 250 C315 245 320 235 315 220 L310 180 C308 170 300 165 290 168 L285 230 C285 240 290 250 300 250 Z"
            fill="url(#chrome)"
            stroke="#90B0C8"
            strokeWidth="1"
          />
          <Path
            d="M302 242 C310 240 312 233 310 222 L306 188 C305 180 300 177 294 178 L292 228 C292 236 296 244 302 242 Z"
            fill="url(#reflection)"
            opacity={0.6}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
