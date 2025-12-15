export class CategoryResponseDto {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  parent?: {
    id: string;
    name: string;
  };
  
  children?: CategoryResponseDto[];
  
  // Дополнительные поля для удобства
  level?: number; // Уровень в иерархии (0 - корневая, 1 - подкатегория, и т.д.)
  path?: string; // Полный путь категории (например: "Электроника > Смартфоны > iPhone")
  hasChildren?: boolean; // Есть ли у категории дочерние элементы
}

