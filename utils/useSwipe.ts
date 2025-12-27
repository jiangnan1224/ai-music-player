import { useState, TouchEvent } from 'react';

interface SwipeHandlers {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
}

interface SwipeResult {
    onTouchStart: (e: TouchEvent) => void;
    onTouchEnd: (e: TouchEvent) => void;
}

export const useSwipe = ({ onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }: SwipeHandlers): SwipeResult => {
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
    const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

    // Minimum distance required for a swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart({
            x: e.targetTouches[0].clientX,
            y: e.targetTouches[0].clientY,
        });
    };

    const onTouchEnd = (e: TouchEvent) => {
        setTouchEnd({
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
        });

        if (!touchStart || !e.changedTouches || e.changedTouches.length === 0) return;

        const distanceX = touchStart.x - e.changedTouches[0].clientX;
        const distanceY = touchStart.y - e.changedTouches[0].clientY;
        const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

        if (isHorizontal) {
            if (Math.abs(distanceX) < minSwipeDistance) return;
            if (distanceX > 0) {
                // Swiped Left
                onSwipeLeft && onSwipeLeft();
            } else {
                // Swiped Right
                onSwipeRight && onSwipeRight();
            }
        } else {
            if (Math.abs(distanceY) < minSwipeDistance) return;
            if (distanceY > 0) {
                // Swiped Up
                onSwipeUp && onSwipeUp();
            } else {
                // Swiped Down
                onSwipeDown && onSwipeDown();
            }
        }
    };

    return {
        onTouchStart,
        onTouchEnd,
    };
};
