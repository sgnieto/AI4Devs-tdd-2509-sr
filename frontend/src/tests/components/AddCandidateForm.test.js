import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddCandidateForm from '../../components/AddCandidateForm';

// Mock de FileUploader
jest.mock('../../components/FileUploader', () => {
  return function MockFileUploader({ onChange, onUpload }) {
    return (
      <div data-testid="file-uploader">
        <button onClick={() => onUpload({ filePath: '/test.pdf', fileType: 'application/pdf' })}>
          Mock Upload
        </button>
      </div>
    );
  };
});

// Mock de react-datepicker
jest.mock('react-datepicker', () => {
  return function MockDatePicker({ selected, onChange, placeholderText }) {
    return (
      <input
        data-testid={`datepicker-${placeholderText}`}
        value={selected ? selected.toISOString().slice(0, 10) : ''}
        onChange={(e) => {
          if (onChange) {
            onChange(new Date(e.target.value));
          }
        }}
        placeholder={placeholderText}
      />
    );
  };
});

// Mock global de fetch
global.fetch = jest.fn();

describe('AddCandidateForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Renderizado', () => {
    test('debe_renderizar_formulario_completo', () => {
      // Arrange & Act
      render(<AddCandidateForm />);

      // Assert
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument(); // 'Debería renderizar el campo nombre'
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument(); // 'Debería renderizar el campo apellido'
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument(); // 'Debería renderizar el campo email'
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument(); // 'Debería renderizar el campo teléfono'
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument(); // 'Debería renderizar el campo dirección'
    });

    test('debe_renderizar_componente_FileUploader', () => {
      // Arrange & Act
      render(<AddCandidateForm />);

      // Assert
      expect(screen.getByTestId('file-uploader')).toBeInTheDocument(); // 'Debería renderizar el componente FileUploader'
    });

    test('debe_renderizar_botones_de_accion', () => {
      // Arrange & Act
      render(<AddCandidateForm />);

      // Assert
      expect(screen.getByRole('button', { name: /añadir educación/i })).toBeInTheDocument(); // 'Debería renderizar botón añadir educación'
      expect(screen.getByRole('button', { name: /añadir experiencia laboral/i })).toBeInTheDocument(); // 'Debería renderizar botón añadir experiencia'
      expect(screen.getByRole('button', { name: /enviar/i })).toBeInTheDocument(); // 'Debería renderizar botón enviar'
    });
  });

  describe('Manejo de Estado - Campos Básicos', () => {
    test('debe_actualizar_firstName_al_escribir', () => {
      // Arrange
      render(<AddCandidateForm />);
      const firstNameInput = screen.getByLabelText(/nombre/i);

      // Act
      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });

      // Assert
      expect(firstNameInput).toHaveValue('Juan'); // 'El campo firstName debería tener el valor Juan'
    });

    test('debe_actualizar_email_al_escribir', () => {
      // Arrange
      render(<AddCandidateForm />);
      const emailInput = screen.getByLabelText(/correo electrónico/i);

      // Act
      fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });

      // Assert
      expect(emailInput).toHaveValue('juan@example.com'); // 'El campo email debería tener el valor correcto'
    });
  });

  describe('Manejo de Secciones Dinámicas - Educación', () => {
    test('debe_anadir_nueva_educacion_al_hacer_clic', () => {
      // Arrange
      render(<AddCandidateForm />);
      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });

      // Act
      fireEvent.click(addEducationButton);

      // Assert
      expect(screen.getByPlaceholderText(/institución/i)).toBeInTheDocument(); // 'Debería aparecer el campo institución'
      expect(screen.getByPlaceholderText(/título/i)).toBeInTheDocument(); // 'Debería aparecer el campo título'
    });

    test('debe_eliminar_educacion_al_hacer_clic', () => {
      // Arrange
      render(<AddCandidateForm />);
      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      // Act
      const deleteButton = screen.getByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButton);

      // Assert
      expect(screen.queryByPlaceholderText(/institución/i)).not.toBeInTheDocument(); // 'No debería aparecer el campo institución después de eliminar'
    });
  });

  describe('Manejo de Secciones Dinámicas - Experiencia Laboral', () => {
    test('debe_anadir_nueva_experiencia_al_hacer_clic', () => {
      // Arrange
      render(<AddCandidateForm />);
      const addExperienceButton = screen.getByRole('button', { name: /añadir experiencia laboral/i });

      // Act
      fireEvent.click(addExperienceButton);

      // Assert
      expect(screen.getByPlaceholderText(/empresa/i)).toBeInTheDocument(); // 'Debería aparecer el campo empresa'
      expect(screen.getByPlaceholderText(/puesto/i)).toBeInTheDocument(); // 'Debería aparecer el campo puesto'
    });
  });

  describe('Envío del Formulario', () => {
    test('debe_enviar_formulario_exitosamente', async () => {
      // Arrange
      const mockResponse = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => mockResponse
      });

      render(<AddCandidateForm />);
      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      // Act
      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith( // 'Debería llamar a fetch con la URL correcta'
          'http://localhost:3010/candidates',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/candidato añadido con éxito/i)).toBeInTheDocument(); // 'Debería mostrar mensaje de éxito'
      });
    });

    test('debe_formatear_fechas_a_YYYY_MM_DD', async () => {
      // Arrange
      const mockResponse = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => mockResponse
      });

      render(<AddCandidateForm />);
      const addEducationButton = screen.getByRole('button', { name: /añadir educación/i });
      fireEvent.click(addEducationButton);

      const startDateInput = screen.getByTestId('datepicker-Fecha de Inicio');
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      // Llenar campos básicos requeridos
      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan' } });
      fireEvent.change(screen.getByLabelText(/apellido/i), { target: { value: 'Pérez' } });
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'juan@example.com' } });

      // Act
      fireEvent.change(startDateInput, { target: { value: '2020-01-15' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
        const callArgs = global.fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.educations[0].startDate).toBe('2020-01-15');  // 'La fecha debería estar en formato YYYY-MM-DD'
      });
    });

    test('debe_mostrar_error_si_respuesta_400', async () => {
      // Arrange
      global.fetch.mockResolvedValueOnce({
        status: 400,
        json: async () => ({ message: 'Invalid name' })
      });

      render(<AddCandidateForm />);
      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      // Act
      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/error al añadir candidato/i)).toBeInTheDocument(); // 'Debería mostrar mensaje de error'
      });
    });

    test('debe_enviar_sin_cv_si_no_hay_archivo', async () => {
      // Arrange
      const mockResponse = { id: 1 };
      global.fetch.mockResolvedValueOnce({
        status: 201,
        json: async () => mockResponse
      });

      render(<AddCandidateForm />);
      const firstNameInput = screen.getByLabelText(/nombre/i);
      const lastNameInput = screen.getByLabelText(/apellido/i);
      const emailInput = screen.getByLabelText(/correo electrónico/i);
      const submitButton = screen.getByRole('button', { name: /enviar/i });

      // Act
      fireEvent.change(firstNameInput, { target: { value: 'Juan' } });
      fireEvent.change(lastNameInput, { target: { value: 'Pérez' } });
      fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
      fireEvent.click(submitButton);

      // Assert
      await waitFor(() => {
        const callArgs = global.fetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.cv).toBeNull(); // 'El CV debería ser null si no hay archivo'
      });
    });
  });
});

