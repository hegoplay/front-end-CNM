export interface IconButtonProps {
  icon: React.ReactNode;
  selectedIcon?: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "none"; // Thêm prop size để tùy chỉnh
  style?: React.CSSProperties;
}