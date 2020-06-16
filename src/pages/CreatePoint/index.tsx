import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from './../../services/api'
import axios from 'axios';

import Dropzone from '../../components/Dropzone';

import './styles.css';

import logo from '../../assets/logo.svg';
import { ECANCELED } from 'constants';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff',
        },
    }),
);
function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStylesSucess = makeStyles((theme: Theme) => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

// estado para array ou objeto: informar manualmente o tipo da variável


interface itemProps {
    id: number;
    title: string;
    image_url: string;
}

interface IbgeUfProps {
    sigla: string;
    nome: string;
}

interface IbgeCityProps {
    nome: string;
}

interface positionProps {
    latitude: number;
    longitude: number;
}

const CreatePoint = () => {



    const classesSucess = useStylesSucess();
    const [openSucess, setOpenSucess] = React.useState(false);

    const handleClick = () => {
        setOpenSucess(true);
    };

    const handleCloseSucess = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSucess(false);
    };








    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
    };



    const [items, setItems] = useState<itemProps[]>([]);
    const [ufs, setUfs] = useState<IbgeUfProps[]>([]);
    const [selectedUf, setSelectedUF] = useState<IbgeUfProps>({ sigla: '0', nome: '0' });
    const [cityes, setCityes] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();


    const [initialPosition, setInitialPosition] = useState<positionProps>({ latitude: -15.7928866, longitude: -47.8394866 });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    })

    const [selectedCity, setSelectedCity] = useState<string>('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<positionProps>({ latitude: -15.7928866, longitude: -47.8394866 });

    const history = useHistory();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            try {
                setSelectedPosition({
                    latitude: Number(position.coords.latitude),
                    longitude: Number(position.coords.longitude)
                });
            } catch (e) {
            }
        })
    }, []);

    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, []); // array vazio: única vez

    useEffect(() => {
        axios.get<IbgeUfProps[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then((response) => {
            const ufsInitials = response.data;
            setUfs(ufsInitials);
        });
    }, []);

    useEffect(() => {
        // carregar as cidades toda vez que o usuário selecionar uma UF diferente
        if (selectedUf.sigla === '0') {
            return;
        }
        axios.get<IbgeCityProps[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf.sigla}/municipios`).then((response) => {
            const cictyesNames = response.data.map(city => city.nome);
            setCityes(cictyesNames);
        });
    }, [selectedUf]);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedUF({ sigla: event.target.value, nome: 'unused' });
    }

    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>) {
        setSelectedCity(event.target.value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition({
            latitude: event.latlng.lat,
            longitude: event.latlng.lng
        });
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    }

    function handleItemClick(id: number) {
        const arreadySelected = selectedItems.includes(id);
        if (arreadySelected) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const regUf = /^\w\w$/;
        const regCity = /^.+$/g;

        const { name, email, whatsapp } = formData;
        const uf = selectedUf.sigla;
        const city = selectedCity;
        const { latitude, longitude } = selectedPosition;
        const items = selectedItems;

        const ufMatch = uf.match(regUf);
        const cityMatch = city.match(regCity);

        console.log(ufMatch)
        console.log(cityMatch)

        console.log(items.length)

        if (
            uf.match(regUf) != null &&
            city.match(regCity) != null &&
            items.length != 0 &&
            selectedFile != undefined
        ) {
            handleToggle();

            const data = new FormData();
            
                data.append('name', name);
                data.append('email', email);
                data.append('whatsapp', whatsapp);
                data.append('uf', uf);
                data.append('city', city);
                data.append('latitude', String(latitude));
                data.append('longitude', String(longitude));
                data.append('items', items.join(','));
                data.append('image', selectedFile);

            await api.post('points', data);

            for (let index = 0; index < 500; index++) {
                console.log(index);
            }

            handleClose();
            //alert('Ponto de coleta criado!')
            handleClick();
            history.push('/')
        } else {
            alert('Erro! Verifique os inputs e tente novamente.');
        }
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                    </Link>
            </header>
            <form>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile}></Dropzone>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                            pattern="^[\w\d ]{2,}$"
                            x-moz-errormessage="ERRO: faça a correspondência com o formato especificado"
                            placeholder="Nome da entidade"
                            minLength={4}
                            maxLength={50} />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                                pattern="^\S+@\w+\.\w{2,6}(\.\w{2})?$"
                                x-moz-errormessage="ERRO: faça a correspondência com o formato especificado"
                                placeholder="email@exemplo.com.br"
                                minLength={5}
                                maxLength={50} />
                        </div> <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                                pattern="^(\(?\d{2}\)?\s?)?\d{4,5}[- ]?\d{4}$"
                                x-moz-errormessage="ERRO: faça a correspondência com o formato especificado"
                                placeholder="99 99999 9999"
                                minLength={7}
                                maxLength={20} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={[selectedPosition.latitude, selectedPosition.longitude]} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[selectedPosition.latitude, selectedPosition.longitude]} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUf.sigla} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => {
                                    return (
                                        <option key={uf.sigla} value={uf.sigla}>{uf.nome}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                <option value="0">Selecione uma cidade</option>
                                {cityes.map(city => {
                                    return (
                                        <option key={city} value={city}>{city}</option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => {
                            return (
                                <li key={item.id} onClick={() => handleItemClick(item.id)} className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                    <img src={item.image_url} alt={item.title} />
                                    <span>{item.title}</span>
                                </li>
                            );
                        })}
                    </ul>
                </fieldset>
                <div className={classesSucess.root}>

                    <Button variant="outlined" color="primary" onClick={handleSubmit}>
                        Cadastrar
                </Button>

                    <Snackbar open={openSucess} autoHideDuration={6000} onClose={handleCloseSucess}>
                        <Alert onClose={handleCloseSucess} severity="success">
                            Ponto cadastrado
                    </Alert>
                    </Snackbar>
                </div>
                <div>
                    <Backdrop className={classes.backdrop} open={open}>
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </div>
            </form>

        </div>
    );
}

export default CreatePoint;