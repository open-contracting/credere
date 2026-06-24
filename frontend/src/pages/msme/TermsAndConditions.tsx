import { List, ListItem, Link as MUILink } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import FAQComponent from "../../components/FAQComponent";

function TermsAndConditions() {
  const { t } = useT();
  const navigate = useNavigate();

  return (
    <>
      <Title type="page" label={t("Terms and Conditions")} className="mb-4" />
      <Text className="text-sm mb-12">{t("Version 3: Octubre de 2024")}</Text>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          <Title type="subsection" label={t("1. ¿QUÉ ES CREDERE?")} className="mb-4" />
          <Text className="mb-8">
            {t(
              'Credere es un proyecto desarrollado por Open Contracting Partnership (“OCP”) para facilitar el acceso a crédito a las micro, pequeñas y medianas empresas ("MIPYMES"), así como a otras empresas de mayor tamaño, que que resultan adjudicatarias de contratos con el Estado colombiano (el “Proyecto”). A través del Proyecto, OCP busca ofrecer a las empresas opciones de crédito de varias entidades financieras (las “Entidades Financieras”). Las aplicaciones de crédito serán gestionadas a través de la presente plataforma tecnológica (en adelante “Credere” o la “Herramienta”).',
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "La herramienta cuenta con un sistema automatizado que utiliza datos abiertos para contactar a las empresas adjudicatarias de un contrato público para ofrecer alternativas de productos crediticios. Credere brinda una interfaz que permite a las empresas elegir entre esas alternativas y allegar documentos relevantes para aplicar al producto crediticio de su interés. Una vez las empresas han enviado sus aplicaciones de crédito, la plataforma permite a las Entidades Financieras participantes hacer la revisión documental para surtir el proceso de revisión y aprobación o rechazo del crédito.",
            )}
          </Text>

          <Title type="subsection" label={t("2. ¿QUÉ REGULAN ESTOS TÉRMINOS Y CONDICIONES?")} className="mb-4" />
          <Text className="mb-8">
            {t(
              "Estos términos y condiciones (los “TyC”) regulan el acceso a y/o uso de Credere por parte los solicitantes de crédito (los “Solicitantes”) y de las Entidades Financieras, quienes en conjunto con los Solicitantes se denominan los “Usuarios”.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Lea con detenimiento estos TyC, pues incluyen derechos y obligaciones para OCP, Usuarios y Entidades Financieras, que usted acepta al usar Credere.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Si usted no está de acuerdo con cualquiera de los términos que aplicarán al usar Credere, deberá abstenerse de inmediato de usar los servicios que ésta ofrece.",
            )}
          </Text>

          <Title type="subsection" label={t("3. CARACTERÍSTICAS DE LA HERRAMIENTA")} className="mb-4" />
          <Title type="subsection" label={t("3.1. Registro en la Herramienta")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "Cada Entidad Financiera tendrá una o más credenciales  para acceder a Credere, las cuales serán asignadas por OCP al momento de concretar la alianza con la Entidad Financiera. Será necesario asignar una contraseña a cada credencial, siguiendo las indicaciones de OCP sobre los parámetros de contraseñas.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Cada vez que la Entidad Financiera acceda a Credere, lo hará utilizando un mecanismo de doble autenticación,  mediante el login y contraseña asociados a cada una de sus credenciales, así como mediante el código de verificación que se enviará cada vez que acceda a la Herramienta. La administración del usuario y la contraseña son responsabilidad de la Entidad Financiera, quien tendrá también la responsabilidad de gestionar los accesos de sus propios funcionarios.",
            )}
          </Text>
          <Title type="subsection" label={t("3.2. Mapa del sitio")} className="mb-6" />
          <Text className="mb-8">
            {t("La Herramienta está conformada por varios sub-sitios que sirven para los siguientes propósitos:")}
          </Text>
          <Text className="mb-8">
            {t(
              "Sitio de cada Entidad Financiera: Contiene un dashboard con las estadísticas generales de las aplicaciones que se han presentado tales como el número de créditos solicitados, otorgados, el tiempo que se ha invertido en promedio en el análisis de cada solicitud, el monto total de créditos otorgados, entre otros. También contiene el detalle de cada una de las aplicaciones que se han gestionado, así como el estado en el que se encuentra la solicitud de crédito. La Plataforma aloja la información en una nube dedicada de OCP provista por terceros, mediante interfases de conexión, las cuales manejan a su vez sus propios términos y condiciones.",
            )}
          </Text>
          <Title type="subsection" label={t("3.3. Servicios")} className="mb-6" />
          <Title type="subsection" label={t("Solicitud de crédito y cargue de documentos: ")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "La solicitud de crédito iniciará cuando la empresa que sea contactada, demuestre interés en conocer más sobre Credere y decida con cuál Entidad Financiera desea aplicar. En ese momento, el Solicitante recibirá un requerimiento para subir algunos documentos indispensables para el estudio de crédito por parte de la Entidad Financiera.",
            )}
          </Text>
          <Title type="subsection" label={t("Estudio de los documentos:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "Una vez recibidos los documentos por parte del Solicitante, OCP los pondrá a disposición de la Entidad Financiera en su perfil de Credere, para que ésta los analice.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Todos los documentos relacionados con el proceso de solicitud de crédito se pondrán a disposición de la Entidad Financiera exclusivamente a través de Credere.",
            )}
          </Text>
          <List className="mb-8">
            {t("Los estados de solicitud pueden ser: ")}
            <ListItem>{t("- Pendiente")}</ListItem>
            <ListItem>{t("- Aceptada")}</ListItem>
            <ListItem>{t("- Expirada")}</ListItem>
            <ListItem>{t("- Declinada")}</ListItem>
            <ListItem>{t("- Enviada")}</ListItem>
            <ListItem>{t("- Iniciada")}</ListItem>
            <ListItem>{t("- Aprobada")}</ListItem>
            <ListItem>{t("- Rechazada")}</ListItem>
            <ListItem>{t("- Información solicitada")}</ListItem>
          </List>
          <Text className="mb-8">
            {t(
              "La Entidad Financiera deberá actualizar inmediatamente en Credere, en un plazo que no supere el que se haya acordado entre OCP y la Entidad Financiera en el Acuerdo de Nivel de Servicio correspondiente (SLA), todo lo que ocurra en relación con cada una de las solicitudes de crédito que reciba y procese, con el fin de mantener un único canal centralizado de información, para que OCP esté al corriente del avance de cada solicitud de crédito, y para que pueda llevar indicadores sobre el funcionamiento de la Herramienta.",
            )}
          </Text>
          <Title type="subsection" label={t("Solicitud de documentos adicionales:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "En el evento en que la Entidad Financiera requiera la actualización de algún documento ya proporcionado por el Solicitante, así lo informará a través de Credere, de manera que a través de la Herramienta se envíe un correo al Solicitante.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "El Solicitante deberá cargar los nuevos documentos, que quedarán a disposición de la Entidad Financiera en Credere.",
            )}
          </Text>
          <Title type="subsection" label={t("Aprobación del crédito:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "Si la Entidad Financiera aprueba el crédito, hará la respectiva anotación en Credere para que se le notifique inmediatamente al Solicitante, dentro del plazo acordado con OCP en el respectivo SLA.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Una vez aprobado el crédito, la Entidad Financiera pondrá a disposición del Solicitante el contrato de crédito que podrá suscribir para formalizar el acceso al crédito. Si ell Solicitante decide suscribir el contrato de crédito con la Entidad Financiera, una vez firmado por ambas partes, la Entidad Financiera deberá cargarlo en Credere. A partir de la suscripción del contrato, se entiende que se genera una relación comercial autónoma entre el Solicitante y la Entidad Financiera, quien, además, pasará a ser la Responsable del Tratamiento de los datos personales del Solicitante.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Así mismo, OCP no tendrá injerencia alguna en la definición de las condiciones del crédito (tasa, plazo y otras condiciones) que ofrezca la Entidad Financiera, las cuales dará a conocer al Solicitante antes de la suscripción del contrato de crédito.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "La Entidad Financiera deberá actualizar en Credere la información relacionada con el desembolso del crédito al Solicitante cuando el desembolso se haga efectivo, dentro del plazo acordado entre la Entidad Financiera y OCP en el respectivo SLA.",
            )}
          </Text>
          <Title type="subsection" label={t("Rechazo del crédito:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "Si la Entidad Financiera rechaza la solicitud de crédito, hará la respectiva anotación en Credere, dentro del plazo acordado en el SLA, para que se le notifique inmediatamente al Solicitante.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "En ese momento, se le informará al Solicitante si es posible que inicie una nueva solicitud de crédito con una Entidad Financiera diferente, y en caso de que así sea, se le indicarán los pasos a seguir.",
            )}
          </Text>
          <Title
            type="subsection"
            label={t("Estudio de crédito por parte de otra Entidad Financiera:")}
            className="mb-8"
          />
          <Text className="mb-8">
            {t(
              "En el evento en que una Entidad Financiera decida no aprobar un crédito a un Solicitante, éste tendrá la oportunidad de aplicar nuevamente a un crédito con otra Entidad Financiera.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Para ello, el Solicitante podrá elegir compartir con la nueva Entidad Financiera los documentos que ya estaban cargados en Credere, podrá reemplazarlos por otros, y deberá cargar los documentos adicionales que solicite la nueva Entidad Financiera, de ser el caso.",
            )}
          </Text>
          <Title type="subsection" label={t("Expiración de la solicitud:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "Si el Solicitante no carga la totalidad de los documentos en el plazo que se le otorgue para ello, o no actualiza los documentos que le indique la Entidad Financiera a través de Credere, se le enviará una comunicación pasados 3 días de enviada la primera comunicación, para recordarle que tiene acciones pendientes. Si pasados 14 días adicionales el Solicitante no completa la solicitud como se le ha indicado, se entenderá que el Solicitante ha desistido de la solicitud.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Este evento no se marcará como un rechazo del crédito, pero conllevará que el Solicitante no pueda enviar nuevas solicitudes de crédito asociadas al proceso de selección relacionado con la solicitud desistida.",
            )}
          </Text>
          <Title
            type="subsection"
            label={t("Desistimiento de la solicitud y eliminación de información por parte del Solicitante:")}
            className="mb-8"
          />
          <Text className="mb-8">
            {t(
              "En cualquier momento, el Solicitante podrá desistir voluntariamente de la solicitud de crédito ante la Entidad Financiera, y podrá pedir la eliminación de la información que haya entregado, siempre y cuando no medie un deber legal de conservarla.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "En cualquier caso, OCP conservará, cuando menos, la información que sea de naturaleza pública asociada al Solicitante, para propósitos estadísticos y construcción de indicadores del Proyecto.",
            )}
          </Text>
          <Title type="subsection" label={t("3.4. Funcionalidades de la Herramienta")} className="mb-6" />
          <Title type="subsection" label={t("Cargue de documentos:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "La Herramienta ofrece la posibilidad a los Solicitantes de cargar la información que requieran las Entidades Financieras para hacer el análisis de sus solicitudes de crédito, a través los botones de carga que se habilitarán en los correos electrónicos que recibirán los Solicitantes.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Los Solicitantes no requerirán obtener login ni contraseña de la Herramienta, sino que accederán a través de un enlace único que recibirán en su correo electrónico.",
            )}
          </Text>
          <Title type="subsection" label={t("Consulta de información:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "Credere permite a las Entidades Financieras consultar y descargar dichos documentos para analizar las solicitudes y aprobar o improbar el crédito.",
            )}
          </Text>
          <Title type="subsection" label={t("Confidencialidad:")} className="mb-8" />
          <Text className="mb-8">
            {t(
              "La parametrización de Credere garantiza que la información que un Solicitante comparta con una Entidad Financiera, únicamente podrá ser conocida por dicha Entidad Financiera y por OCP.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Las Entidades Financieras únicamente tendrán acceso a la información correspondiente a solicitudes de crédito que hayan hecho a su respectiva entidad, pro no las solicitudes que se hayan hecho a otras Entidades Financieras.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "OCP será la única entidad con acceso a toda la información de los Solicitantes, y se obliga a no compartirla con terceros diferentes a la Entidad Financiera que haya seleccionado el Solicitante. ",
            )}
          </Text>
          <Title
            type="subsection"
            label={t("4. PROPIEDAD INTELECTUAL, DATOS PERSONALES Y SEGURIDAD DE LA INFORMACIÓN")}
            className="mb-4"
          />
          <Title type="subsection" label={t("4.1. Propiedad intelectual y signos distintivos")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "El Usuario reconoce y acepta que Credere contienen información protegida y de carácter confidencial. Asimismo, el Usuario reconoce y acepta que el contenido o la información que está disponible o hace parte de la Herramienta está, o puede estar protegida por derechos de autor, marcas, nombres comerciales, u otros derechos de propiedad intelectual. Salvo por el material licenciado con licencias de software libre o contenidos abiertos Creative Commons, el Usuario acepta abstenerse de intentar identificar o determinar de cualquier forma la estructura o composición de la información, desarrollo, contenido, o software, disponibles o que hagan parte de la Herramienta, con el fin de replicarlos modificarlos, reproducirlos, copiarlos, o de cualquier forma explotarlos en todo o en parte.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "El Usuario reconoce que todos los logotipos y nombres de los productos y servicios de OCP y/o de las Entidades Financieras son o pueden ser marcas sobre las cuales no se cede ningún derecho.",
            )}
          </Text>
          <Title type="subsection" label={t("4.2. Protección de datos personales")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "OCP recolectará directamente datos públicos, semiprivados y privados de los Solicitantes y actuará como Responsable del Tratamiento (persona o empresa que recolecta datos personales y los trata o procesa en su propio nombre de manera autónoma.) y los tratará de acuerdo con lo señalado en su Política de Tratamiento de Datos Personales disponible en https://www.open-contracting.org/es/about/our-privacy-policy/.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Adicionalmente, el Solicitante cargará documentos que OCP compartirá con la(s) Entidad(es) Financiera(s), quienes inicialmente actuarán como Encargados (persona o empresa que recolecta y/o procesa datos en nombre de un Responsable del tratamiento) de OCP para estudiar las correspondientes solicitudes de crédito y quienes, al momento de generarse un vínculo directo con el Solicitante, se convertirán en Responsables del Tratamiento.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Los Solicitantes deben abstenerse de subir datos personales sensibles o de menores de edad y en cualquier caso deben proteger la privacidad de los titulares de quienes suben datos personales.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Al aceptar estos TyC, el Solicitante declara que conoce y autoriza de manera previa, expresa e informada el tratamiento de sus datos personales de acuerdo con la Política de Tratamiento de Datos de OCP, para las finalidades allí previstas. Así mismo, el Usuario reconoce que en la Política de Tratamiento de Datos se incluyen los procedimientos de consulta y reclamación que permiten hacer efectivos sus derechos al acceso, conocimiento, consulta, rectificación, actualización, y supresión de sus datos personales. Así mismo, el Usuario conoce que podrá presentar cualquier solicitud referida a los datos personales a través del correo electrónico credere@open-contracting.org.",
            )}
          </Text>
          <Title type="subsection" label={t("4.3. Seguridad de la información")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "OCP usa altos estándares de tecnologías y procedimientos de seguridad de la información que buscan garantizar la integridad, confidencialidad y disponibilidad de la información allí consignada por el Solicitante y/o por la Entidad Financiera.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Sin embargo, no puede asegurar que no existan errores esporádicos en el funcionamiento de los procedimientos de seguridad y salvaguardia de la información por su parte o por parte de los terceros que contrata para la provisión de diferentes servicios (nube, hosting, etc.), así como accesos malintencionados de terceros (hackers, malware, entre otros), que podrían poner en riesgo la estabilidad de Credere y de los datos allí alojados, de manera temporal o permanente.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "En el remoto evento en que los datos alojados por los Usuarios se vean comprometidos por un ataque malintencionado de terceros, OCP actuará con la mayor diligencia para mitigar los riesgos o daños derivados de la modificación supresión o secuestro de la información de los Usuarios, y les notificará cuando sea pertinente.",
            )}
          </Text>
          <Title type="subsection" label={t("5. CONDICIONES GENERALES")} className="mb-4" />
          <Title type="subsection" label={t("5.1 Modificación")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "OCP se reserva el derecho de modificar estos TyC en cualquier momento para reflejar los nuevos servicios y condiciones de uso de la Plataforma.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Las modificaciones se anunciarán al Usuario con un plazo razonable antes de que se hagan efectivas, de manera que éste tenga tiempo suficiente de enterarse de las nuevas condiciones, y resolver las inquietudes que le surjan, en caso de tenerlas.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Si el Usuario sigue usando los servicios de la Plataforma después de que las modificaciones se hagan efectivas, se entiende que acepta obligarse a las modificaciones de los TyC.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Si el Usuario no está de acuerdo con las modificaciones a los TyC, debe abstenerse de usar la Plataforma y sus servicios.",
            )}
          </Text>
          <Title type="subsection" label={t("5.2 Correcto uso de Credere")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "Usted se compromete a utilizar los servicios de Credere adecuadamente, siguiendo las normas aplicables y solamente para los propósitos para los cuales ha sido creada la herramienta.",
            )}
          </Text>
          <Title type="subsection" label={t("5.3 Almacenamiento de la información")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "OCP almacena en la nube la información de los Usuarios, y para ello contrata servicios de terceros. Dichos terceros ofrecen garantías de seguridad de la información y cumplen con altos estándares de calidad de servicio.",
            )}
          </Text>
          <Title type="subsection" label={t("5.4 Ley aplicable y jurisdicción")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "Estos TyC se rigen por las leyes de la República de Colombia. Cualquier controversia que derive de los mismos se someterá a los jueces competentes de acuerdo con la legislación colombiana.",
            )}
          </Text>
          <Title type="subsection" label={t("5.5 Indemnidad")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "El Usuario acepta expresamente que mantendrá indemne a OCP por los daños y perjuicios que pudieren sufrir con ocasión de una utilización de la Plataforma contraria a las normas aplicables y a estos TyC.",
            )}
          </Text>
          <Title type="subsection" label={t("5.6 Exoneración y garantías")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "OCP advierte a los Usuarios que la información de Credere puede contener errores o inexactitudes involuntarios, por lo cual se reserva el derecho de corregir cualquier error, omisión o inexactitud, cambiar o actualizar la misma en cualquier momento y sin previo aviso, o de alertar a los Usuarios sobre alguna inconsistencia en la información cargada.",
            )}
          </Text>
          <Text className="mb-8">
            {t(
              "Con respecto a las Autoridades nacionales e internacionales, empresas, productos y/o servicios a los cuales se haga referencia en la Plataforma, así como los enlaces (links), se advierte que OCP no tiene responsabilidad alguna sobre el correcto funcionamiento de los links, o sobre la veracidad y actualidad de la información contenida en ellos o publicada por las Autoridades o empresas. Así, cuando se sugieran enlaces o uso de servicios de terceros, dicho uso será autónomo del Usuario.",
            )}
          </Text>
          <Title type="subsection" label={t("5.7 Responsabilidad del Usuario")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "El Usuario responderá por los daños y perjuicios que se ocasionen en Credere como consecuencia del incumplimiento de estos TyC o de la ley. El Usuario reconoce y acepta que el acceso y uso a la Plataforma se realiza bajo su propia cuenta, riesgo y responsabilidad.",
            )}
          </Text>
          <Title type="subsection" label={t("5.8 Consultas")} className="mb-6" />
          <Text className="mb-8">
            {t(
              "Cualquier inquietud relacionada con el uso de la Plataforma podrá remitirse por correo electrónico a credere@open-contracting.org.",
            )}
          </Text>
          <div className="mt-5 mb-10 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button className="md:mr-4" primary={false} label={t("Go back")} onClick={() => navigate(-1)} />
            </div>
            <div>
              <Button
                label={t("Learn more about OCP")}
                target="_blank"
                rel="noreferrer"
                component={MUILink}
                href={`${import.meta.env.VITE_MORE_INFO_OCP_URL || "https://www.open-contracting.org/es/"}`}
              />
            </div>
          </div>
        </div>
        <div className="my-6 md:my-0 md:ml-10">
          <FAQComponent />
        </div>
      </div>
    </>
  );
}

export default TermsAndConditions;
