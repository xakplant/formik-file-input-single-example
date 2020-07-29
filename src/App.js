import React, { useRef } from 'react';
import { FieldArray, Formik } from 'formik'
import * as yup from 'yup'

const App = () => {

  const inputRef = useRef()

  /**
   * Получаем массив файлов из FileList
   * @param {*} fileList 
   */
  const getFileArray = (fileList) => {
    return Array.from(fileList)
  }

  /**
   * Хелпер для установки занчения в формике
   * пример будет актуален для инпутов с одним файлом
   * для множественных значений нужно будет переработать
   * @param {*} event 
   * @param {*} values 
   * @param {*} arrayHelper 
   */
  const handleFileChange = (event, values, arrayHelper) => {
    const arrFiles = getFileArray(event.target.files)
    const file = arrFiles.length ? arrFiles[0] : undefined

    if (!file) return
    // Проверяем есть ли значения
    if (Array.isArray(values)) {
      /**
       * Заменяем значение по индексу 0 на наш новый файл
       * обратите внимение что мы вставляем объект { file: File }
       * так будет лечге валидировать
       * если нужно будет валифировать другие свойства файла то расширьте объект
       * и схему валидации 
       * @example { file: File, type: File.type }
       * 
       * для варианта с множеством файлом предлагаю вам вынести часть
       * кода с <FieldArray> в отдельный компонент, при передачи пропров 
       * компонент будет рендериться зановов и вы будете всегда работать 
       * с чистым arrayHelper и только всегда пушить
       */
      arrayHelper.replace(0, { file })
    } else {
      // Или вставляем если ещё нет ни одного значения
      arrayHelper.push({ file })
    }

    /**
     * Создаём новый fileList, хотя от того можно отказаться
     * вставляем его в наш ref
     */
    const dt = new DataTransfer()
    arrFiles.forEach((file) => {
      dt.items.add(file)
    })

    inputRef.current.files = dt.files
  }

  /**
   * Дополнительное действие при очистке формы
   * без него может не срабатывать onChange
   */
  const handleDelete = () => {
    const dt = new DataTransfer()
    // Тут вставляем пустой FileList
    inputRef.current.files = dt.files
  }

  /**
   * Валидационная схема
   * Если вы будете расширять схему валидации для файла 
   * то начните после file: yup..., ВАШ КОД ДАЛЕЕ
   */
  const validationShema = yup.object().shape({
    fileInput: yup.array().of(yup.object().shape({
      // test('НАЗВАНИЕ ОШИБКИ', 'ОПИСАНИЕ ОШИБКИ', Функция проверки)
      file: yup.mixed().test('fileSize', 'fileSize', (value) => value ? value.size < 1 : false),
    }))
  })


  /**
   * Функция для печати ошибок
   * для ошибок массивов в errors будет обхект 
   * типа { [НАЗВАНИЕ ОШИБКИ]: ОПИСАНИЕ ОШИБКИ }
   * @param {*} errors 
   */
  const printErrors = (errors) => {
    if (Array.isArray(errors)) {
      return errors.map((obj) => Object.values(obj).map((error) => <p key={error}>{error}</p>))
    }
    if (typeof errors === 'string') {
      return errors
    }
    return null
  }

  return (
    <div>
      <Formik
        initialValues={{}}
        validateOnChange
        validateOnBlur
        validateOnMount
        onSubmit={(values) => console.log(values)}
        validationSchema={validationShema}
      >
        {({ values, errors, isValid, handleSubmit, handleReset }) => (
          <>
            <label htmlFor={`fileInput`}>
              Загрузить файл
            </label>
            {
              /**
               * fileInput - такое же как и у инпута с которым работаем
               */
            }
            <FieldArray
              name={`fileInput`}
              render={arrayHelper => (
                <>
                  <input
                    ref={inputRef}
                    name={`fileInput`}
                    type={`file`}
                    accept={`.pdf`}
                    onChange={(event) => {
                      handleFileChange(event, values.fileInput, arrayHelper)
                    }}
                  />
                  {printErrors(errors.fileInput)}
                </>
              )}
            />
            <div>
              <button disabled={!isValid} onClick={handleSubmit} type={`submit`}>Отправить</button>
            </div>
            <button onClick={(event) => {
              handleReset(event)
              // Обязательно наш хелпер для удаления (переачи нового FileList в input)
              handleDelete()
            }} type={`submit`}>Отчистить</button>
          </>
        )}
      </Formik>
    </div>
  );
}

export default App;
