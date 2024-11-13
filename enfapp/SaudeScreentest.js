import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SaudeScreen from './SaudeScreen'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

describe('SaudeScreen', () => {
  beforeEach(() => {
    AsyncStorage.clear();
  });

  test('deve renderizar corretamente', async () => {
    const { getByText, getByPlaceholderText } = render(<SaudeScreen />);

    expect(getByText('Registro de Sintomas')).toBeTruthy();
    expect(getByPlaceholderText('Descreva os sintomas de hoje')).toBeTruthy();
  });

  test('deve adicionar sintoma ao pressionar o botão "Adicionar Sintoma"', async () => {
    const { getByText, getByPlaceholderText } = render(<SaudeScreen />);

    const input = getByPlaceholderText('Descreva os sintomas de hoje');
    const addButton = getByText('Adicionar Sintoma');

    fireEvent.changeText(input, 'Dor de cabeça');
    
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(getByText('Dor de cabeça')).toBeTruthy();
    });
  });

  test('deve exibir alerta se tentar adicionar sintoma vazio', async () => {
    const { getByText } = render(<SaudeScreen />);

    const addButton = getByText('Adicionar Sintoma');

    fireEvent.press(addButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro', 
        'Descreva os seus sintomas'
      );
    });
  });

  test('deve atualizar o dia selecionado ao pressionar um botão de dia', async () => {
    const { getByText } = render(<SaudeScreen />);

    const tercaButton = getByText('Terça');
    
    fireEvent.press(tercaButton);

    expect(getByText('Terça')).toHaveStyle({ backgroundColor: 'lightblue' });
  });

  test('deve limpar sintomas de um dia ao pressionar o "X"', async () => {
    const { getByText, getByTestId } = render(<SaudeScreen />);

    const input = getByText('Descreva os sintomas de hoje');
    const addButton = getByText('Adicionar Sintoma');

    fireEvent.changeText(input, 'Dor nas costas');
    fireEvent.press(addButton);

    const deleteButton = getByText('✕');

    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(() => getByText('Dor nas costas')).toThrow();
    });
  });
});
