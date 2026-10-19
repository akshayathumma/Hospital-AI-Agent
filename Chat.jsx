import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaFileExport, FaFilePdf, FaMicrophone, FaMicrophoneSlash, FaPaperPlane, FaTrash } from "react-icons/fa";
import ChatWindow from "../components/ChatWindow";
import useChat from "../hooks/useChat";
import useSpeech from "../hooks/useSpeech";
import { downloadChatAsPDF, exportChatAsJSON, exportChatAsText } from "../services/exportChat";

export default function Chat() {
  const { messages, loading, send, clear } = useChat();
  const speech = useSpeech();
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const textareaRef = useRef(null);

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  };

  const submit = (text) => {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setInput("");
    requestAnimationFrame(resize);
    send(value);
  };

  const handleVoice = () => {
    if (speech.listening) {
      speech.stopListening();
      return;
    }
    speech.startListening(
      (transcript) => setInput((prev) => (prev ? `${prev} ${transcript}` : transcript)),
      (err) => toast.error(`Voice input error: ${err}`)
    );
  };

  const exportWith = (fn) => {
    setMenuOpen(false);
    if (!messages.length) return toast.error("Nothing to export yet");
    fn(messages);
    toast.success("Chat exported");
  };

  return (
    <div className="card mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col overflow-hidden !bg-slate-50 dark:!bg-slate-900/60">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
        <div>
          <h1 className="font-semibold">AI Pharmacy Assistant</h1>
          <p className="text-xs text-slate-500">Grounded in your medicine inventory</p>
        </div>
        <div className="relative flex items-center gap-2">
          <button onClick={() => setMenuOpen((o) => !o)} className="btn-ghost" title="Export chat">
            <FaFileExport /> <span className="hidden sm:inline">Export</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-600 dark:bg-slate-800">
              <button onClick={() => exportWith(downloadChatAsPDF)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                <FaFilePdf className="text-red-500" /> Download as PDF
              </button>
              <button onClick={() => exportWith(exportChatAsText)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                Export as TXT
              </button>
              <button onClick={() => exportWith(exportChatAsJSON)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-700">
                Export as JSON
              </button>
            </div>
          )}
          <button onClick={clear} disabled={!messages.length} className="btn-ghost disabled:opacity-40" title="Clear chat">
            <FaTrash /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <ChatWindow messages={messages} loading={loading} speech={speech} onSuggestion={submit} />

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
      >
        {speech.recognitionSupported && (
          <button
            type="button"
            onClick={handleVoice}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${
              speech.listening
                ? "animate-pulse border-red-400 bg-red-50 text-red-600"
                : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
            title={speech.listening ? "Stop listening" : "Voice input"}
          >
            {speech.listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        )}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about a medicine, stock, alternatives or dosage…"
          maxLength={1000}
          className="input max-h-32 resize-none !py-2.5"
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-11 shrink-0 !px-4" title="Send">
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}