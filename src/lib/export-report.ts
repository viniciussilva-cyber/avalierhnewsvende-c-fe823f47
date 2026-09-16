import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Filtra elementos que não devem aparecer na exportação
 * (como botões e modais com a tag data-export-ignore="true")
 */
const filterElements = (node: HTMLElement) => {
  return node.getAttribute?.("data-export-ignore") !== "true";
};

export const exportNodeAsPNG = async (node: HTMLElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2, // Garante alta resolução na imagem
      filter: filterElements,
    });

    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Erro ao gerar PNG:", error);
    throw new Error("Falha na geração da imagem");
  }
};

export const exportNodeAsPDF = async (node: HTMLElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      filter: filterElements,
    });

    // Cria o PDF no formato A4 (Retrato)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    // Calcula a altura proporcional da imagem em relação à largura do A4
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha na geração do PDF");
  }
};
