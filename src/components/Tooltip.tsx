import {
	CSSProperties,
	FC,
	ReactNode,
	RefObject,
	useEffect,
	useRef,
	useState,
} from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';
import { zIndex } from '@/lib/constants/constants';

export interface ITooltipDirection {
	direction: 'right' | 'left' | 'top' | 'bottom';
	align?: 'center' | 'right' | 'left' | 'top' | 'bottom';
}

interface ITooltipProps extends ITooltipDirection {
	parentRef: RefObject<HTMLDivElement>;
	children: ReactNode;
}

const ARROW_SIZE = 8;

export const Tooltip: FC<ITooltipProps> = ({
	parentRef,
	direction,
	align,
	children,
}) => {
	const [style, setStyle] = useState<CSSProperties>({});
	const el = useRef(document.createElement('div'));
	const childRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const current = el.current;
		const body = document.querySelector('body') as HTMLElement;

		if (body) {
			body.appendChild(current);
		}
		return () => {
			body!.removeChild(current);
		};
	}, []);

	useEffect(() => {
		if (!parentRef.current) return;
		// if (!childRef.current) return;
		if (typeof window === 'undefined') return;
		const parentRect = parentRef.current.getBoundingClientRect();
		const childRect = childRef.current?.getBoundingClientRect();

		// console.log('parentRect', parentRect);
		// console.log('childRect', childRect);
		// let isTopOk = parentRect.top - childRect.height >= 0;
		// let isBottomOk =
		// 	parentRect.bottom + childRect.height <= window.innerHeight;
		// let isRightOk = false;
		// let isLeftOk = false;
		// console.log(parentRect.bottom + childRect.height, window.innerHeight);
		const _style = tooltipStyleCalc(
			{
				direction,
				align,
			},
			parentRect,
			childRect,
		);
		setStyle(_style);
	}, [align, direction, parentRef, childRef]);

	return createPortal(
		style.top ? (
			<TooltipContainer
				ref={childRef}
				style={style}
				direction={direction}
				align={align}
			>
				{children}
			</TooltipContainer>
		) : null,
		el.current,
	);
};

const translateXForTopBottom = (
	align: ITooltipDirection['align'],
	parentRect: DOMRect,
) => {
	switch (align) {
		case 'right':
			return `-${ARROW_SIZE}px`;

		case 'left':
			return `calc(-100% + ${parentRect.width + ARROW_SIZE}px)`;

		default:
			return `calc(-50% + ${parentRect.width / 2}px)`;
	}
};

const translateYForRightLeft = (
	align: ITooltipDirection['align'],
	parentRect: DOMRect,
) => {
	switch (align) {
		case 'top':
			return `-100%`;

		case 'bottom':
			return `-${ARROW_SIZE}px`;

		default:
			return `calc(-50% - ${parentRect.height / 2}px)`;
	}
};

const tooltipStyleCalc = (
	position: ITooltipDirection,
	parentRect: DOMRect,
	childRect?: DOMRect,
): CSSProperties => {
	const { align, direction } = position;
	let style = {};
	let translateX;
	let translateY;
	switch (direction) {
		case 'top':
			translateX = translateXForTopBottom(align, parentRect);
			style = {
				top: parentRect.top - ARROW_SIZE,
				left: parentRect.left,
				transform: `translate(${translateX}, -100%)`,
			};
			break;
		case 'bottom':
			translateX = translateXForTopBottom(align, parentRect);
			style = {
				top: parentRect.bottom + ARROW_SIZE,
				left: parentRect.left,
				transform: `translate(${translateX}, 0)`,
			};
			break;
		case 'right':
			translateY = translateYForRightLeft(align, parentRect);
			style = {
				top: parentRect.bottom,
				left: parentRect.right + ARROW_SIZE,
				transform: `translate(0, ${translateY})`,
			};
			break;
		case 'left':
			translateY = translateYForRightLeft(align, parentRect);
			style = {
				top: parentRect.bottom,
				left: parentRect.left - ARROW_SIZE,
				transform: `translate(-100%, ${translateY})`,
			};
			break;
	}
	return style;
};

const TooltipContainer = styled.div<ITooltipDirection>`
	position: fixed;
	padding: 0;
	background-color: black;
	color: #fff;
	border-radius: 6px;
	padding: 8px;
	z-index: ${zIndex.TOOLTIP};
	top: 0;
	left: 0;
`;
