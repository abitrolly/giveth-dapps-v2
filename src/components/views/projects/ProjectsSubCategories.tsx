import React from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useProjectsContext } from '@/context/projects.context';

function ProjectsSubCategories() {
	const { variables, setVariables, selectedMainCategory } =
		useProjectsContext();
	const subCategories = selectedMainCategory?.categories;

	return subCategories ? (
		<CustomizedSwiper slidesPerView='auto' spaceBetween={24}>
			{subCategories.map(subCategory => (
				<SwiperSlide key={subCategory.value}>
					<SubCategoryItem
						isSelected={
							variables?.category ===
							subCategory.value?.toLowerCase()
						}
						onClick={() =>
							setVariables(prevVariables => {
								return {
									...prevVariables,
									category: subCategory.value?.toLowerCase(),
								};
							})
						}
					>
						{subCategory.name}
					</SubCategoryItem>
				</SwiperSlide>
			))}
		</CustomizedSwiper>
	) : null;
}

const SubCategoryItem = styled.div<{ isSelected?: boolean }>`
	text-transform: capitalize;
	user-select: none;
	padding: 0 12px 8px 12px;
	border-bottom: ${props => (props.isSelected ? '2px solid black' : 'none')};
	cursor: pointer;
`;

const CustomizedSwiper = styled(Swiper)`
	margin-left: 0;
`;

export default ProjectsSubCategories;
