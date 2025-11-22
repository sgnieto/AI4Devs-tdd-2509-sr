import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUploader from '../../components/FileUploader';

// Mock global de fetch
global.fetch = jest.fn();

describe('FileUploader Component', () => {
  const mockOnChange = jest.fn();
  const mockOnUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('Renderizado', () => {
    test('debe_renderizar_input_file', () => {
      // Arrange & Act
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      // Assert
      const fileInput = screen.getByLabelText(/file/i);
      expect(fileInput).toBeInTheDocument(); // 'Debería renderizar el input de archivo'
      expect(fileInput).toHaveAttribute('type', 'file'); // 'El input debería ser de tipo file'
    });

    test('debe_renderizar_boton_subir', () => {
      // Arrange & Act
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      // Assert
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });
      expect(uploadButton).toBeInTheDocument(); // 'Debería renderizar el botón de subir'
    });

    test('debe_renderizar_nombre_archivo_seleccionado', () => {
      // Arrange & Act
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);

      // Assert
      const fileNameText = screen.getByText(/selected file:/i);
      expect(fileNameText).toBeInTheDocument(); // 'Debería renderizar el texto de archivo seleccionado'
    });
  });

  describe('Selección de Archivo', () => {
    test('debe_actualizar_estado_al_seleccionar_archivo', () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Assert
      expect(mockOnChange).toHaveBeenCalledWith(mockFile); // 'Debería llamar a onChange con el archivo'
      expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument(); // 'Debería mostrar el nombre del archivo'
    });

    test('debe_mostrar_nombre_archivo_seleccionado', () => {
      // Arrange
      const mockFile = new File(['content'], 'documento.pdf', { type: 'application/pdf' });
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Assert
      expect(screen.getByText(/documento\.pdf/i)).toBeInTheDocument(); // 'Debería mostrar el nombre del archivo seleccionado'
    });

    test('debe_llamar_onChange_al_seleccionar', () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });

      // Assert
      expect(mockOnChange).toHaveBeenCalledTimes(1); // 'Debería llamar a onChange cuando se selecciona un archivo'
      expect(mockOnChange).toHaveBeenCalledWith(mockFile); // 'Debería llamar a onChange con el archivo seleccionado'
    });
  });

  describe('Subida de Archivo', () => {
    test('debe_subir_archivo_exitosamente', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        filePath: '/path/to/file.pdf',
        fileType: 'application/pdf'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith( // 'Debería llamar a fetch con la URL correcta'
          'http://localhost:3010/upload',
          expect.objectContaining({
            method: 'POST',
            body: expect.any(FormData)
          })
        );
      });

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(mockResponse); // 'Debería llamar a onUpload con los datos del archivo'
      });
    });

    test('debe_mostrar_estado_loading_durante_subida', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      let resolveFetch: any;

      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      global.fetch.mockReturnValueOnce(fetchPromise);

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        const spinner = screen.getByRole('status');
        expect(spinner).toBeInTheDocument(); // 'Debería mostrar el spinner durante la subida'
      });

      // Resolver la promesa
      resolveFetch({
        ok: true,
        json: async () => ({ filePath: '/path/to/file.pdf', fileType: 'application/pdf' })
      });
    });

    test('debe_mostrar_mensaje_exito', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        filePath: '/path/to/file.pdf',
        fileType: 'application/pdf'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/archivo subido con éxito/i)).toBeInTheDocument(); // 'Debería mostrar mensaje de éxito'
      });
    });

    test('debe_llamar_onUpload_con_datos_correctos', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const mockResponse = {
        filePath: '/uploads/test.pdf',
        fileType: 'application/pdf'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith({ // 'Debería llamar a onUpload con filePath y fileType'
          filePath: '/uploads/test.pdf',
          fileType: 'application/pdf'
        });
      });
    });
  });

  describe('Alternative Path', () => {
    test('debe_ocultar_loading_aunque_falle', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /subir archivo/i });
        expect(button).toHaveTextContent('Subir Archivo'); // 'El botón debería volver a mostrar el texto después del error'
      });
    });

    test('debe_mostrar_error_si_respuesta_no_ok', async () => {
      // Arrange
      const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const fileInput = screen.getByLabelText(/file/i);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.change(fileInput, { target: { files: [mockFile] } });
      fireEvent.click(uploadButton);

      // Assert
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled(); // 'Debería registrar el error en la consola'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Casos Límite', () => {
    test('debe_manejar_subida_sin_archivo_seleccionado', async () => {
      // Arrange
      render(<FileUploader onChange={mockOnChange} onUpload={mockOnUpload} />);
      const uploadButton = screen.getByRole('button', { name: /subir archivo/i });

      // Act
      fireEvent.click(uploadButton);

      // Assert
      expect(global.fetch).not.toHaveBeenCalled(); // 'No debería llamar a fetch si no hay archivo seleccionado'
      expect(mockOnUpload).not.toHaveBeenCalled(); // 'No debería llamar a onUpload si no hay archivo seleccionado'
    });
  });
});

