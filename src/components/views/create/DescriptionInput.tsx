import React, { useState } from 'react';
import {
	H5,
	Caption,
	brandColors,
	semanticColors,
} from '@giveth/ui-design-system';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { useFormContext } from 'react-hook-form';

import { InputContainer, Label } from './Create.sc';
import { GoodProjectDescription } from '@/components/modals/GoodProjectDescription';
import { EInputs } from '@/components/views/create/CreateProject';

const RichTextInput = dynamic(() => import('@/components/RichTextInput'), {
	ssr: false,
});

const DescriptionInput = () => {
	const { getValues, setValue } = useFormContext();

	const [showModal, setShowModal] = useState(false);
	const [description, setDescription] = useState(
		getValues(EInputs.description),
	);

	const handleDescription = (value: string) => {
		setDescription(value);
		setValue(EInputs.description, value);
	};

	return (
		<>
			{showModal && (
				<GoodProjectDescription
					setShowModal={val => setShowModal(val)}
				/>
			)}

			<H5>Tell us about your project...</H5>
			<CaptionContainer>
				Aim for 200-500 words.{' '}
				<span onClick={() => setShowModal(true)}>
					How to write a good project description.
				</span>
			</CaptionContainer>
			<InputContainerStyled>
				<Label>Project story</Label>
				<RichTextInput
					style={TextInputStyle}
					setValue={handleDescription}
					value={description}
				/>
			</InputContainerStyled>
			{/*<ErrorStyled>{error || null}</ErrorStyled>*/}
		</>
	);
};

const InputContainerStyled = styled(InputContainer)<{ error?: string }>`
	.ql-container.ql-snow,
	.ql-toolbar.ql-snow {
		border: ${props =>
			props.error && `2px solid ${semanticColors.punch[500]}`};
	}

	&:focus-within {
		.ql-toolbar.ql-snow,
		.ql-container.ql-snow {
			border: ${props =>
				!props.error && `2px solid ${brandColors.giv[600]}`};
		}
	}
`;

const ErrorStyled = styled.div`
	margin-top: -10px;
	margin-bottom: 20px;
	color: ${semanticColors.punch[500]};
	font-size: 12px;
	word-break: break-word;
`;

const CaptionContainer = styled(Caption)`
	margin: 8.5px 0 0 0;
	span {
		cursor: pointer;
		color: ${brandColors.pinky[500]};
	}
`;

const TextInputStyle = {
	marginTop: '4px',
	fontFamily: 'body',
};

export default DescriptionInput;
