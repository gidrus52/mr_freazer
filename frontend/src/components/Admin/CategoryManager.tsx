import { defineComponent, ref, reactive, onMounted, computed } from 'vue'
import { 
    NForm, 
    NFormItem, 
    NInput, 
    NButton, 
    NText, 
    NCard, 
    NSpace,
    NTable,
    NPopconfirm,
    NSelect,
    NTree,
    NTreeSelect,
    NDivider,
    NTag,
    createDiscreteApi 
} from 'naive-ui'
import { 
    createCategory, 
    getCategories, 
    updateCategory, 
    deleteCategory,
    getSubcategories,
    createSubcategory,
    getCategoriesWithSubcategories,
    type Category
} from '../../utils/api'

interface CategoryForm {
    name: string
    description: string
    parentId?: number | string | null
}

interface SubcategoryForm {
    name: string
    description: string
    parentId: number | string
}

const { message } = createDiscreteApi(['message'])

export default defineComponent({
    name: 'CategoryManager',
    setup() {
        const loading = ref(false)
        const categories = ref<Category[]>([])
        const editingCategory = ref<Category | null>(null)
        const activeTab = ref('categories')
        const selectedParentCategory = ref<number | string | null>(null)
        
        const categoryForm = reactive<CategoryForm>({
            name: '',
            description: '',
            parentId: null
        })

        const subcategoryForm = reactive<SubcategoryForm>({
            name: '',
            description: '',
            parentId: 0
        })

        // Вычисляемое свойство для получения только родительских категорий
        const parentCategories = computed(() => {
            return categories.value.filter(cat => !cat.parentId)
        })

        // Вычисляемое свойство для получения подкатегорий выбранной категории
        const subcategories = computed(() => {
            if (!selectedParentCategory.value) return []
            return categories.value.filter(cat => cat.parentId === selectedParentCategory.value)
        })

        const loadCategories = async () => {
            loading.value = true
            try {
                console.log('=== ЗАГРУЗКА КАТЕГОРИЙ ===')
                // Пытаемся загрузить категории с подкатегориями
                let result = await getCategoriesWithSubcategories()
                
                // Если не получилось, загружаем обычные категории
                if (!result.success) {
                    result = await getCategories()
                }
                
                console.log('Результат загрузки категорий:', result)
                
                if (result.success && result.data) {
                    categories.value = result.data
                    console.log('✅ Категории загружены:', result.data.length)
                } else {
                    if (result.statusCode === 401) {
                        console.error('❌ Ошибка 401 при загрузке категорий')
                        message.error('Ошибка авторизации при загрузке категорий')
                        
                        // Очищаем невалидные данные
                        localStorage.removeItem('authToken')
                        localStorage.removeItem('isAdmin')
                        localStorage.removeItem('adminUser')
                    } else {
                        message.error(result.message || 'Ошибка загрузки категорий')
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки категорий:', error)
                message.error('Ошибка загрузки категорий')
            } finally {
                loading.value = false
            }
        }

        const handleSubmit = async () => {
            if (!categoryForm.name.trim()) {
                message.error('Введите название категории')
                return
            }

            console.log('=== СОЗДАНИЕ/ОБНОВЛЕНИЕ КАТЕГОРИИ ===')
            console.log('Данные категории:', {
                name: categoryForm.name,
                description: categoryForm.description
            })

            // Проверяем аутентификацию перед отправкой
            const token = localStorage.getItem('authToken')
            const isAdmin = localStorage.getItem('isAdmin')
            
            console.log('Проверка аутентификации:')
            console.log('- Токен:', token ? `найден (${token.substring(0, 20)}...)` : 'не найден')
            console.log('- isAdmin:', isAdmin)
            
            if (!token || !isAdmin) {
                console.error('❌ Нет аутентификации для создания категории')
                message.error('Ошибка авторизации. Пожалуйста, войдите в систему заново.')
                return
            }

            loading.value = true
            try {
                let result
                if (editingCategory.value) {
                    // Обновление существующей категории
                    console.log('Обновление категории ID:', editingCategory.value.id)
                    result = await updateCategory(editingCategory.value.id!, {
                        name: categoryForm.name,
                        description: categoryForm.description,
                        parentId: categoryForm.parentId
                    })
                } else {
                    // Создание новой категории
                    console.log('Создание новой категории')
                    result = await createCategory({
                        name: categoryForm.name,
                        description: categoryForm.description,
                        parentId: categoryForm.parentId
                    })
                }

                console.log('Результат операции:', result)

                if (result.success) {
                    message.success(editingCategory.value ? 'Категория обновлена!' : 'Категория создана!')
                    resetForm()
                    await loadCategories()
                } else {
                    if (result.statusCode === 401) {
                        console.error('❌ Ошибка 401 при создании категории')
                        message.error('Ошибка авторизации. Пожалуйста, войдите в систему заново.')
                        
                        // Очищаем невалидные данные
                        localStorage.removeItem('authToken')
                        localStorage.removeItem('isAdmin')
                        localStorage.removeItem('adminUser')
                    } else {
                        message.error(result.message || 'Ошибка сохранения категории')
                    }
                }
            } catch (error) {
                console.error('Ошибка сохранения категории:', error)
                message.error('Ошибка сохранения категории')
            } finally {
                loading.value = false
            }
        }

        const handleEdit = (category: Category) => {
            editingCategory.value = category
            categoryForm.name = category.name
            categoryForm.description = category.description || ''
            categoryForm.parentId = category.parentId || null
        }

        const handleDelete = async (id: number) => {
            try {
                const result = await deleteCategory(id)
                if (result.success) {
                    message.success('Категория удалена!')
                    await loadCategories()
                } else {
                    message.error(result.message || 'Ошибка удаления категории')
                }
            } catch (error) {
                console.error('Ошибка удаления категории:', error)
                message.error('Ошибка удаления категории')
            }
        }

        const handleSubcategorySubmit = async () => {
            if (!subcategoryForm.name.trim()) {
                message.error('Введите название подкатегории')
                return
            }

            if (!subcategoryForm.parentId) {
                message.error('Выберите родительскую категорию')
                return
            }

            console.log('=== СОЗДАНИЕ ПОДКАТЕГОРИИ ===')
            console.log('Данные подкатегории:', subcategoryForm)

            loading.value = true
            try {
                const result = await createSubcategory(subcategoryForm.parentId, {
                    name: subcategoryForm.name,
                    description: subcategoryForm.description
                })

                console.log('Результат создания подкатегории:', result)

                if (result.success) {
                    message.success('Подкатегория создана!')
                    resetSubcategoryForm()
                    await loadCategories()
                } else {
                    if (result.statusCode === 401) {
                        message.error('Ошибка авторизации. Пожалуйста, войдите в систему заново.')
                        localStorage.removeItem('authToken')
                        localStorage.removeItem('isAdmin')
                        localStorage.removeItem('adminUser')
                    } else {
                        message.error(result.message || 'Ошибка создания подкатегории')
                    }
                }
            } catch (error) {
                console.error('Ошибка создания подкатегории:', error)
                message.error('Ошибка создания подкатегории')
            } finally {
                loading.value = false
            }
        }

        const resetForm = () => {
            categoryForm.name = ''
            categoryForm.description = ''
            categoryForm.parentId = null
            editingCategory.value = null
        }

        const resetSubcategoryForm = () => {
            subcategoryForm.name = ''
            subcategoryForm.description = ''
            subcategoryForm.parentId = 0
        }

        const cancelEdit = () => {
            resetForm()
        }

        onMounted(() => {
            loadCategories()
        })

        return {
            loading,
            categories,
            categoryForm,
            subcategoryForm,
            editingCategory,
            activeTab,
            selectedParentCategory,
            parentCategories,
            subcategories,
            handleSubmit,
            handleSubcategorySubmit,
            handleEdit,
            handleDelete,
            resetForm,
            resetSubcategoryForm,
            cancelEdit
        }
    },
    render() {
        return (
            <div>
                <NCard title="Управление категориями" style={{ marginBottom: '20px' }}>
                    <NSpace vertical>
                        <NSpace>
                            <NButton 
                                type={this.activeTab === 'categories' ? 'primary' : 'default'}
                                onClick={() => this.activeTab = 'categories'}
                            >
                                Категории
                            </NButton>
                            <NButton 
                                type={this.activeTab === 'subcategories' ? 'primary' : 'default'}
                                onClick={() => this.activeTab = 'subcategories'}
                            >
                                Подкатегории
                            </NButton>
                        </NSpace>
                        
                        {this.activeTab === 'categories' && (
                            <div>
                                <NDivider titlePlacement="left">Создание категории</NDivider>
                                <NForm model={this.categoryForm} labelPlacement="top">
                                    <NFormItem label="Название категории" required>
                                        <NInput 
                                            value={this.categoryForm.name}
                                            onUpdateValue={(value) => this.categoryForm.name = value}
                                            placeholder="Введите название категории"
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label="Родительская категория">
                                        <NSelect
                                            value={this.categoryForm.parentId}
                                            onUpdateValue={(value) => this.categoryForm.parentId = value}
                                            placeholder="Выберите родительскую категорию (необязательно)"
                                            clearable
                                            options={this.parentCategories.map(cat => ({
                                                label: cat.name,
                                                value: cat.id
                                            }))}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label="Описание">
                                        <NInput 
                                            value={this.categoryForm.description}
                                            onUpdateValue={(value) => this.categoryForm.description = value}
                                            placeholder="Введите описание категории"
                                            type="textarea"
                                            rows={3}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem>
                                        <NSpace>
                                            <NButton 
                                                type="primary" 
                                                size="large"
                                                loading={this.loading}
                                                onClick={this.handleSubmit}
                                            >
                                                {this.editingCategory ? 'Обновить категорию' : 'Добавить категорию'}
                                            </NButton>
                                            
                                            {this.editingCategory && (
                                                <NButton 
                                                    size="large"
                                                    onClick={this.cancelEdit}
                                                >
                                                    Отмена
                                                </NButton>
                                            )}
                                        </NSpace>
                                    </NFormItem>
                                </NForm>
                            </div>
                        )}
                        
                        {this.activeTab === 'subcategories' && (
                            <div>
                                <NDivider titlePlacement="left">Создание подкатегории</NDivider>
                                <NForm model={this.subcategoryForm} labelPlacement="top">
                                    <NFormItem label="Родительская категория" required>
                                        <NSelect
                                            value={this.subcategoryForm.parentId}
                                            onUpdateValue={(value) => this.subcategoryForm.parentId = value}
                                            placeholder="Выберите родительскую категорию"
                                            options={this.parentCategories.map(cat => ({
                                                label: cat.name,
                                                value: cat.id
                                            }))}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label="Название подкатегории" required>
                                        <NInput 
                                            value={this.subcategoryForm.name}
                                            onUpdateValue={(value) => this.subcategoryForm.name = value}
                                            placeholder="Введите название подкатегории"
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem label="Описание">
                                        <NInput 
                                            value={this.subcategoryForm.description}
                                            onUpdateValue={(value) => this.subcategoryForm.description = value}
                                            placeholder="Введите описание подкатегории"
                                            type="textarea"
                                            rows={3}
                                            size="large"
                                        />
                                    </NFormItem>
                                    
                                    <NFormItem>
                                        <NButton 
                                            type="primary" 
                                            size="large"
                                            loading={this.loading}
                                            onClick={this.handleSubcategorySubmit}
                                        >
                                            Добавить подкатегорию
                                        </NButton>
                                    </NFormItem>
                                </NForm>
                                
                                <NDivider titlePlacement="left">Просмотр подкатегорий</NDivider>
                                <NFormItem label="Выберите категорию для просмотра подкатегорий">
                                    <NSelect
                                        value={this.selectedParentCategory}
                                        onUpdateValue={(value) => this.selectedParentCategory = value}
                                        placeholder="Выберите категорию"
                                        options={this.parentCategories.map(cat => ({
                                            label: cat.name,
                                            value: cat.id
                                        }))}
                                        size="large"
                                    />
                                </NFormItem>
                            </div>
                        )}
                    </NSpace>
                </NCard>

                <NCard title="Список категорий и подкатегорий">
                    <NTable 
                        data={this.categories}
                        loading={this.loading}
                        columns={[
                            {
                                title: 'ID',
                                key: 'id',
                                width: 80
                            },
                            {
                                title: 'Название',
                                key: 'name',
                                render: (row: Category) => (
                                    <NSpace align="center">
                                        <span>{row.name}</span>
                                        {row.parentId && (
                                            <NTag type="info" size="small">Подкатегория</NTag>
                                        )}
                                    </NSpace>
                                )
                            },
                            {
                                title: 'Родительская категория',
                                key: 'parent',
                                render: (row: Category) => {
                                    if (row.parentId) {
                                        const parent = this.categories.find(cat => cat.id === row.parentId)
                                        return parent ? parent.name : 'Не найдена'
                                    }
                                    return '-'
                                }
                            },
                            {
                                title: 'Описание',
                                key: 'description'
                            },
                            {
                                title: 'Действия',
                                key: 'actions',
                                width: 200,
                                render: (row: Category) => (
                                    <NSpace>
                                        <NButton 
                                            size="small"
                                            onClick={() => this.handleEdit(row)}
                                        >
                                            Редактировать
                                        </NButton>
                                        <NPopconfirm
                                            onPositiveClick={() => this.handleDelete(row.id!)}
                                        >
                                            {{
                                                trigger: () => (
                                                    <NButton 
                                                        size="small" 
                                                        type="error"
                                                    >
                                                        Удалить
                                                    </NButton>
                                                ),
                                                default: () => 'Вы уверены, что хотите удалить эту категорию?'
                                            }}
                                        </NPopconfirm>
                                    </NSpace>
                                )
                            }
                        ]}
                    />
                </NCard>
                
                {this.activeTab === 'subcategories' && this.selectedParentCategory && this.subcategories.length > 0 && (
                    <NCard title={`Подкатегории для "${this.parentCategories.find(cat => cat.id === this.selectedParentCategory)?.name}"`} style={{ marginTop: '20px' }}>
                        <NTable 
                            data={this.subcategories}
                            loading={this.loading}
                            columns={[
                                {
                                    title: 'ID',
                                    key: 'id',
                                    width: 80
                                },
                                {
                                    title: 'Название',
                                    key: 'name'
                                },
                                {
                                    title: 'Описание',
                                    key: 'description'
                                },
                                {
                                    title: 'Действия',
                                    key: 'actions',
                                    width: 200,
                                    render: (row: Category) => (
                                        <NSpace>
                                            <NButton 
                                                size="small"
                                                onClick={() => this.handleEdit(row)}
                                            >
                                                Редактировать
                                            </NButton>
                                            <NPopconfirm
                                                onPositiveClick={() => this.handleDelete(row.id!)}
                                            >
                                                {{
                                                    trigger: () => (
                                                        <NButton 
                                                            size="small" 
                                                            type="error"
                                                        >
                                                            Удалить
                                                        </NButton>
                                                    ),
                                                    default: () => 'Вы уверены, что хотите удалить эту подкатегорию?'
                                                }}
                                            </NPopconfirm>
                                        </NSpace>
                                    )
                                }
                            ]}
                        />
                    </NCard>
                )}
            </div>
        )
    }
}) 