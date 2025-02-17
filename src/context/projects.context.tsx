import {
	createContext,
	Dispatch,
	ReactNode,
	SetStateAction,
	useContext,
	useState,
} from 'react';
import { IMainCategory } from '@/apollo/types/types';
import { ESortby } from '@/apollo/types/gqlEnums';

interface IVariables {
	sortingBy?: string;
	filters?: string[];
	mainCategory?: string;
	category?: string;
	searchTerm?: string;
}

interface IProjectsContext {
	variables: IVariables;
	setVariables: Dispatch<SetStateAction<IVariables>>;
	mainCategories: IMainCategory[];
	selectedMainCategory?: IMainCategory;
}

const variablesDefaultValue = {
	sortingBy: ESortby.QUALITYSCORE,
	filters: undefined,
};

const ProjectsContext = createContext<IProjectsContext>({
	variables: variablesDefaultValue,
	setVariables: () => console.log('setVariables not initialed yet!'),
	mainCategories: [],
});

ProjectsContext.displayName = 'ProjectsContext';

export const ProjectsProvider = (props: {
	children: ReactNode;
	mainCategories: IMainCategory[];
	selectedMainCategory?: IMainCategory;
}) => {
	const { children, mainCategories, selectedMainCategory } = props;

	const [variables, setVariables] = useState<IVariables>(
		variablesDefaultValue,
	);

	return (
		<ProjectsContext.Provider
			value={{
				variables,
				setVariables,
				mainCategories,
				selectedMainCategory,
			}}
		>
			{children}
		</ProjectsContext.Provider>
	);
};

export function useProjectsContext() {
	const context = useContext(ProjectsContext);

	if (!context) {
		throw new Error('Projects context not found!');
	}

	return context;
}
