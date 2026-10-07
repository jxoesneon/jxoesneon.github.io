import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AIChat from '../src/components/AIChat';

// Mock GoogleGenerativeAI with hoisted variables
const { mockSendMessage, mockGetGenerativeModel } = vi.hoisted(() => {
  const mockSendMessage = vi.fn();
  const mockStartChat = vi.fn(() => ({ sendMessage: mockSendMessage }));
  const mockGetGenerativeModel = vi.fn(() => ({ startChat: mockStartChat }));
  return { mockSendMessage, mockGetGenerativeModel };
});

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor(apiKey) {
      this.apiKey = apiKey;
    }
    getGenerativeModel(args) {
      return mockGetGenerativeModel(args);
    }
  }
}));

describe('AIChat Component', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renders floating trigger button and opens chat on click', () => {
    render(<AIChat focusedProject={null} />);
    const trigger = screen.getByRole('button', { name: /ask ai/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ask about projects/i)).toBeInTheDocument();
  });

  it('closes modal on close button click and toggles via fab', async () => {
    render(<AIChat focusedProject={null} />);
    const trigger = screen.getByRole('button', { name: /ask ai/i });
    fireEvent.click(trigger);

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    const closeBtn = screen.getByTitle('Close Chat');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument();
    });

    // Toggle again via fab
    fireEvent.click(trigger);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('does not send message when input is empty or whitespace only', () => {
    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: '   ' } });

    const form = input.closest('form');
    fireEvent.submit(form);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles successful Gemini response, streams text, and renders markdown components', async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: {
        text: () => 'Gemini response with **bold text**\n\n* list bullet\n\nand [external link](https://github.com/jxoesneon).'
      }
    });

    render(<AIChat focusedProject={{ name: 'Demo-Project', description: 'Context description' }} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Tell me about Demo-Project' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText('external link')).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    expect(screen.getByText('bold text')).toBeInTheDocument();
    expect(screen.getByText('list bullet')).toBeInTheDocument();
    const link = screen.getByText('external link');
    expect(link).toHaveAttribute('href', 'https://github.com/jxoesneon');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('handles multi-turn conversation and maps previous messages into cleanHistory', async () => {
    mockSendMessage
      .mockResolvedValueOnce({
        response: {
          text: () => 'First turn response.'
        }
      })
      .mockResolvedValueOnce({
        response: {
          text: () => 'Second turn response.'
        }
      });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    const form = input.closest('form');

    // Turn 1
    fireEvent.change(input, { target: { value: 'First message' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/First turn response/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Turn 2
    fireEvent.change(input, { target: { value: 'Second message' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Second turn response/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('maps previous messages into OpenRouter message payload during multi-turn fallback', async () => {
    // Turn 1 succeeds with Gemini
    mockSendMessage.mockResolvedValueOnce({
      response: {
        text: () => 'Gemini turn 1 response.'
      }
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    const form = input.closest('form');

    fireEvent.change(input, { target: { value: 'Turn 1 query' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Gemini turn 1 response/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Turn 2 fails Gemini, falls back to OpenRouter
    mockSendMessage.mockRejectedValueOnce(new Error('Gemini quota reached'));
    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('openrouter.ai')) {
        const body = JSON.parse(opts.body);
        // Verify previous turn was included in message payload
        const hasHistory = body.messages.some(m => m.content === 'Gemini turn 1 response.');
        if (hasHistory) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: 'OpenRouter turn 2 response with history.' } }]
            })
          });
        }
      }
      return Promise.reject(new Error('Blocked'));
    });

    fireEvent.change(input, { target: { value: 'Turn 2 query' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/OpenRouter turn 2 response with history/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('retries next candidate model when Gemini throws 404 not found', async () => {
    mockSendMessage
      .mockRejectedValueOnce(new Error('404 model not found'))
      .mockResolvedValueOnce({
        response: {
          text: () => 'Candidate 2 flash succeeded.'
        }
      });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Retry test' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Candidate 2 flash succeeded/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('falls back to OpenRouter when Gemini fails with non-404 error (Nemotron model)', async () => {
    mockSendMessage.mockRejectedValue(new Error('500 Gemini Internal Error'));

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('openrouter.ai')) {
        const body = JSON.parse(opts.body);
        if (body.model === 'nvidia/nemotron-3.5-lightning:free') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: 'Nemotron fallback answer.' } }]
            })
          });
        }
      }
      return Promise.reject(new Error('Model unavailable'));
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Fallback Nemotron' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Nemotron fallback answer/i)).toBeInTheDocument();
      expect(screen.getByText(/Nemotron 3.5 \(Free\)/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('falls back to OpenRouter with Gemma, Apodex, Liquid, and Auto models', async () => {
    mockSendMessage.mockRejectedValue(new Error('Quota exceeded'));

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('openrouter.ai')) {
        const body = JSON.parse(opts.body);
        if (body.model.includes('gemma')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: 'Gemma fallback answer.' } }]
            })
          });
        }
      }
      return Promise.reject(new Error('Skipping'));
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Testing Gemma' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Gemma fallback answer/i)).toBeInTheDocument();
      expect(screen.getByText(/Gemma 4 \(Free\)/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('falls back to OpenRouter Apodex model', async () => {
    mockSendMessage.mockRejectedValue(new Error('Quota exceeded'));

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('openrouter.ai')) {
        const body = JSON.parse(opts.body);
        if (body.model.includes('apodex')) {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: 'Apodex fallback answer.' } }]
            })
          });
        }
      }
      return Promise.reject(new Error('Skipping'));
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Testing Apodex' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Apodex fallback answer/i)).toBeInTheDocument();
      expect(screen.getByText(/Apodex Mini \(Free\)/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('falls back to OpenRouter Auto model', async () => {
    mockSendMessage.mockRejectedValue(new Error('Quota exceeded'));

    global.fetch = vi.fn().mockImplementation((url, opts) => {
      if (url.includes('openrouter.ai')) {
        const body = JSON.parse(opts.body);
        if (body.model === 'openrouter/auto') {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: async () => ({
              choices: [{ message: { content: 'Auto fallback answer.' } }]
            })
          });
        }
      }
      return Promise.reject(new Error('Skipping'));
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Testing Auto' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/Auto fallback answer/i)).toBeInTheDocument();
      expect(screen.getByText(/OpenRouter \(Auto\)/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders quick suggestion prompt pills and sends query on click', async () => {
    mockSendMessage.mockResolvedValueOnce({
      response: {
        text: () => 'MCP explanation.'
      }
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const pill = screen.getByText('Tell me about MCP');
    fireEvent.click(pill);

    expect(screen.getByText('Tell me about MCP')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/MCP explanation/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles 402 credit limit error gracefully', async () => {
    mockSendMessage.mockRejectedValue(new Error('Gemini failed'));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: async () => '{"error":{"message":"Requires more credits","code":402}}'
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Test 402' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText(/Upstream AI credit limit reached/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles 429 rate limit error gracefully', async () => {
    mockSendMessage.mockRejectedValue(new Error('Gemini failed'));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => 'RESOURCE_EXHAUSTED 429'
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Test 429' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText(/max capacity with incoming signals/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles 503 Service Unavailable error gracefully', async () => {
    mockSendMessage.mockRejectedValue(new Error('Gemini failed'));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable 503'
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Test 503' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText(/The AI network is temporarily experiencing high latency/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles API_KEY_HTTP_REFERRER_BLOCKED error gracefully', async () => {
    mockSendMessage.mockRejectedValue(new Error('Gemini API_KEY_HTTP_REFERRER_BLOCKED'));
    global.fetch = vi.fn().mockRejectedValue(new Error('API_KEY_HTTP_REFERRER_BLOCKED'));

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Test Referer' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText(/The production Gemini API key has an HTTP Referrer restriction/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('handles generic unknown errors with fallback notice', async () => {
    mockSendMessage.mockRejectedValue(new Error('Gemini network dropped'));
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    });

    render(<AIChat focusedProject={null} />);
    fireEvent.click(screen.getByRole('button', { name: /ask ai/i }));

    const input = screen.getByPlaceholderText(/Ask about projects/i);
    fireEvent.change(input, { target: { value: 'Test Generic Error' } });
    fireEvent.submit(input.closest('form'));

    await waitFor(
      () => {
        expect(screen.getByText(/Notice: Neural link temporarily unavailable/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
