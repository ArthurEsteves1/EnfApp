import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DescansoScreen from './DescansoScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  Alert: {
    alert: jest.fn(),
  },
}));

describe('DescansoScreen', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks(); 
  });

  test('deve renderizar corretamente', () => {
    const { getByText, getByPlaceholderText } = render(<DescansoScreen />);

    expect(getByText('Horas de Sono')).toBeTruthy();
    expect(getByPlaceholderText('Ex: 8')).toBeTruthy();
  });

  test('deve adicionar registro de horas de sono ao pressionar o botão "Adicionar Horas de Sono"', async () => {
    const { getByText, getByPlaceholderText } = render(<DescansoScreen />);

    const input = getByPlaceholderText('Ex: 8');
    const addButton = getByText('Adicionar Horas de Sono');

    fireEvent.changeText(input, '7');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(getByText('7 horas')).toBeTruthy();
    });
  });

  test('deve exibir alerta se tentar adicionar horas de sono vazias', async () => {
    const { getByText } = render(<DescansoScreen />);

    const addButton = getByText('Adicionar Horas de Sono');

    fireEvent.press(addButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro',
        'Informe as horas de sono'
      );
    });
  });

  test('deve atualizar o dia selecionado ao pressionar um botão de dia', async () => {
    const { getByText } = render(<DescansoScreen />);

    const tercaButton = getByText('Terça');
    fireEvent.press(tercaButton);

    expect(tercaButton).toHaveStyle({ backgroundColor: 'lightblue' });
  });

  test('deve limpar registro de horas de sono de um dia ao pressionar o "X"', async () => {
    const { getByText, getByTestId } = render(<DescansoScreen />);

    const input = getByText('Ex: 8');
    const addButton = getByText('Adicionar Horas de Sono');

    fireEvent.changeText(input, '8');
    fireEvent.press(addButton);

    const deleteButton = getByText('✕');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(() => getByText('8 horas')).toThrow();
    });
  });

  test('deve limpar todos os registros de horas de sono ao pressionar "Limpar tudo"', async () => {
    const { getByText } = render(<DescansoScreen />);

    const input = getByText('Ex: 8');
    const addButton = getByText('Adicionar Horas de Sono');
    const clearAllButton = getByText('Limpar tudo');

    fireEvent.changeText(input, '6');
    fireEvent.press(addButton);
    fireEvent.changeText(input, '7');
    fireEvent.press(addButton);

    fireEvent.press(clearAllButton);

    await waitFor(() => {
      expect(() => getByText('6 horas')).toThrow();
      expect(() => getByText('7 horas')).toThrow();
    });
  });
});
