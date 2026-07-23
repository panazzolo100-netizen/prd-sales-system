"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type SignaturePadProps = {
  title: string;
  name: string;
  defaultValue?: string | null;
};

export function SignaturePad({
  title,
  name,
  defaultValue,
}: SignaturePadProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const drawingRef = useRef(false);

  const [signature, setSignature] =
    useState("");
  const [action, setAction] = useState<"unchanged" | "replace" | "clear">("unchanged");

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !defaultValue) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const image = new Image();

    image.onload = () => {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    image.src = defaultValue;
  }, [defaultValue]);

  function getPosition(
    event:
      | React.PointerEvent<HTMLCanvasElement>
      | React.MouseEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      x:
        ((event.clientX - rect.left) /
          rect.width) *
        canvas.width,

      y:
        ((event.clientY - rect.top) /
          rect.height) *
        canvas.height,
    };
  }

  function startDrawing(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    drawingRef.current = true;

    const position = getPosition(event);

    context.beginPath();
    context.moveTo(position.x, position.y);

    canvas.setPointerCapture(event.pointerId);
  }

  function draw(
    event: React.PointerEvent<HTMLCanvasElement>
  ) {
    if (!drawingRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const position = getPosition(event);

    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#ffffff";

    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function stopDrawing() {
    const canvas = canvasRef.current;

    if (!canvas || !drawingRef.current) {
      return;
    }

    drawingRef.current = false;

    const value = canvas.toDataURL(
      "image/png"
    );

    setSignature(value);
    setAction("replace");
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    setSignature("");
    setAction("clear");
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <button
          type="button"
          onClick={clearSignature}
          className="text-sm font-semibold text-zinc-400 transition hover:text-red-400"
        >
          Limpar
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={300}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        className="mt-4 h-48 w-full touch-none rounded-xl border border-dashed border-zinc-700 bg-zinc-900"
      />

      <input
        type="hidden"
        name={name}
        value={signature}
      />
      <input type="hidden" name={`${name}Action`} value={action} />

      <p className="mt-3 text-sm text-zinc-500">
        Assine com o mouse ou com o dedo.
      </p>
    </div>
  );
}
