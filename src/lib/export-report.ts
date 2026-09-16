import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

/**
 * Filtra elementos que não devem aparecer na exportação
 */
const filterElements = (node: HTMLElement) => {
  return node.getAttribute?.("data-export-ignore") !== "true";
};

export const exportNodeAsPNG = async (node: HTMLElement, fileName: string): Promise<void> => {
  try {
    const dataUrl = await toPng(node, {
      quality: 1.0,
      pixelRatio: 2,
      filter: filterElements,
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "none",
        margin: "0",
      },
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
      width: node.scrollWidth,
      height: node.scrollHeight,
      style: {
        transform: "none",
        margin: "0",
      },
    });

    // Cria o PDF no formato A4 padrão
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calcula a altura total da imagem baseada na largura do A4
    const totalImgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = totalImgHeight;
    let position = 0; // Posição Y da imagem

    // Cola a imagem na primeira página
    pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, totalImgHeight);
    heightLeft -= pdfHeight;

    // Enquanto ainda sobrar conteúdo, cria uma nova página e continua colando
    while (heightLeft > 0) {
      position -= pdfHeight; // Move a imagem para cima para mostrar a próxima parte
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, totalImgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha na geração do PDF");
  }
};
