import React, {PureComponent, Fragment} from 'react';
import SunCalc from 'suncalc2';
import cls from './style.module.scss';

import {Menu, MenuItem} from '@material-ui/core';

import DialogSelectID from '@iobroker/adapter-react/Dialogs/SelectID';
import Utils from '@iobroker/adapter-react/Components/Utils';
// import I18n from '@iobroker/adapter-react/i18n';

import CustomButton from '../CustomButton';
import CustomCheckbox from '../CustomCheckbox';
import CustomInput from '../CustomInput';
import CustomSlider from '../CustomSlider';
import CustomSelect from '../CustomSelect';
import CustomTime from '../CustomTime';
//import {ContextWrapperCreate} from '../ContextWrapper';
import ComplexCron from '../../../ComplexCron';
import CustomModal from '../CustomModal';
import Schedule from '../../../Schedule';
import MaterialDynamicIcon from '../../helpers/MaterialDynamicIcon';
import CustomSwitch from '../CustomSwitch';
import utils from '../../helpers/utils';

// const
class GenericBlock extends PureComponent {
    constructor(props, item) {
        super(props);
        item = item || {};

        // console.log(props, item)
        this.state = {
            inputs: item.inputs || props.inputs,
            name: item.name || props.name,
            icon: item.icon || props.icon,

            tagCardArray: item.tagCardArray || null,
            tagCard: item.tagCardArray ? item.tagCardArray[0] || '' : '',

            showSelectId: false,
            openTagMenu: false,
            openModal: false,
            openCheckbox: false,


            textOptions: [],
            textDef: '',

            numberOptions: [],
            numberDef: '',

            checkboxOptions: [],
            checkboxDef: '',

            sliderOptions: [],
            sliderDef: '',

            buttonOptions: [],
            buttonDef: '',

            objectIDOptions: [],
            objectIDDef: '',

            colorOptions: [],
            colorDef: '',

            timeOfDayOptions: [],
            timeOfDayDef: '',

            dateOptions: [],
            dateDef: '',

            instanceSelectionOptions: [],
            instanceSelectionDef: '',

            settings: {}
        };
    }

    getConfig() {
        return JSON.parse(JSON.stringify(this.state.settings));
    }

    setConfig(settings) {
        this.setState({settings});
    }

    renderText = (input, value, onChange) => {
        const {className} = this.props;
        return <CustomInput
            key={input.attr}
            className={className}
            autoComplete="off"
            label={utils.getName(input.name)}
            variant="outlined"
            size="small"
            value={value}
            onChange={onChange}
        />;
    }

    renderNumber = (input, value, onChange) => {
        const {className} = this.props;
        return <CustomInput
            key={input.attr}
            className={className}
            autoComplete="off"
            label="number"
            variant="outlined"
            size="small"
            type="number"
            value={value}
            onChange={onChange}
        />;
    }

    renderCheckbox = (input, value, onChange) => {
        const {className} = this.props;
        return <CustomCheckbox
            key={input.attr}
            className={className}
            autoComplete="off"
            label="number"
            variant="outlined"
            size="small"
            value={value}
            onChange={onChange}
        />;
    }

    renderSlider = (input, value, onChange) => {
        const {className} = this.props;
        return <CustomSlider
            key={input.attr}
            className={className}
            autoComplete="off"
            label="number"
            variant="outlined"
            size="small"
            value={value}
            onChange={onChange}
        />;
    }

    renderButton = (input, value, onClick) => {
        const {className} = this.props;
        return <CustomButton
            key={input.attr}
            fullWidth
            value='click me'
            className={className}
            onClick={onClick}
        />;
    }

    renderObjectID = (input, value, onChange) => {
        const {showSelectId} = this.state;
        const {className} = this.props;
        const {socket} = this.context;
        // return null
        return <React.Fragment key={input.attr}>
            <CustomButton
                fullWidth
                value='open modal'
                className={className}
                onClick={() => this.setState({showSelectId: true})}
            />
            {showSelectId ? <DialogSelectID
                key="tableSelect"
                imagePrefix="../.."
                dialogName={'javascript'}
                themeType={Utils.getThemeName()}
                socket={socket}
                statesOnly={true}
                // selected={this.selectIdValue}
                onClose={() => this.setState({showSelectId: false})}
                onOk={(selected, name) => {
                    this.setState({showSelectId: false, selectIdValue: selected});
                }}
            /> : null}
        </React.Fragment>;
    }

    renderColor = (input, value, onChange) => {
        const {className} = this.props;
        return <CustomInput
            key={input.attr}
            className={className}
            autoComplete="off"
            fullWidth
            variant="outlined"
            size="small"
            type="color"
            value={value}
            onChange={onChange}
        />;
    }

    renderTimeOfDay = (input, value, onChange) => {
        const {tagCard, openModal, openCheckbox} = this.state;
        const {className} = this.props;
        switch (tagCard) {
            case 'Interval':
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}><span style={{marginRight: 10}}>every</span>
                        <CustomInput
                            className={className}
                            autoComplete="off"
                            fullWidth
                            type="number"
                            variant="outlined"
                            size="small"
                            value={value}
                            onChange={onChange}
                        /></div>
                    <CustomSelect
                        // title='ip'
                        className={className}
                        options={[{value: 'second(s)', title: 'second(s)'}, {
                            value: 'minute(s)',
                            title: 'minute(s)'
                        }, {value: 'hour(s)', title: 'hour(s)'},]}
                        value={'second(s)'}
                        onChange={onChange}
                    />
                </div>;

            case 'CRON':
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={value}
                        onChange={onChange}
                    />
                        <CustomButton
                            fullWidth
                            style={{width: 80, marginLeft: 5}}
                            value='...'
                            className={className}
                            onClick={() => this.setState({openModal: true})}
                        /></div>
                    <CustomModal
                        open={openModal}
                        buttonClick={() => {
                            this.setState({openModal: !openModal});
                        }}
                        close={() => this.setState({openModal: !openModal})}
                        titleButton={'add'}
                        titleButton2={'close'}>
                        <ComplexCron/>
                    </CustomModal>
                    every hour at 0 minutes
                </div>;

            case 'Wizard':
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        disabled
                        variant="outlined"
                        size="small"
                        multiline
                        rows={2}
                        value={"Every hour from 8:00 to 17:00"}
                        onChange={onChange}
                        customValue
                    />
                        <CustomButton
                            fullWidth
                            style={{width: 80, marginLeft: 5}}
                            value='...'
                            className={className}
                            onClick={() => this.setState({openModal: true})}
                        /></div>
                    <CustomModal
                        open={openModal}
                        buttonClick={() => {
                            this.setState({openModal: !openModal});
                        }}
                        close={() => this.setState({openModal: !openModal})}
                        titleButton={'add'}
                        titleButton2={'close'}>
                        <Schedule/>
                    </CustomModal>
                    every hour at 0 minutes
                </div>;

            case 'at':
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}>at <CustomTime style={{marginLeft: 5}}/></div>
                    <CustomSelect
                        // title='ip'
                        key='at'
                        className={className}
                        multiple
                        options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Every day']}
                        value={['Monday']}
                        onChange={onChange}
                    />
                </div>;

            case 'Astro':
                const sunValue = SunCalc.getTimes(new Date(), 51.5, -0.1);
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}>at<CustomSelect
                        // title='ip'
                        key='at'
                        className={className}
                        // multiple
                        style={{marginLeft: 5}}
                        options={Object.keys(sunValue).map((name) => ({
                            value: name,
                            title: name,
                            title2: `[${sunValue[name].getHours() < 10 ? 0 : ''}${sunValue[name].getHours()}:${sunValue[name].getMinutes() < 10 ? 0 : ''}${sunValue[name].getMinutes()}]`
                        }))}
                        value={'solarNoon'}
                        onChange={onChange}
                    />
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomCheckbox
                        className={className}
                        autoComplete="off"
                        label="number"
                        variant="outlined"
                        size="small"
                        style={{marginRight: 5}}
                        value={openCheckbox}
                        onChange={(e) => this.setState({openCheckbox: e})}
                    /> with offset
                    </div>

                    {openCheckbox && <div style={{display: 'flex', alignItems: 'center'}}>offset <CustomInput
                        className={className}
                        autoComplete="off"
                        label="number"
                        variant="outlined"
                        size="small"
                        type="number"
                        style={{marginLeft: 5, marginRight: 5, width: 80}}
                        value={value}
                        onChange={onChange}
                    /> minutes</div>}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>at {`${sunValue['solarNoon'].getHours() < 10 ? 0 : ''}${sunValue['solarNoon'].getHours()}:${sunValue['solarNoon'].getMinutes() < 10 ? 0 : ''}${sunValue['solarNoon'].getMinutes()}`}</div>
                </div>;

            default:
                return <CustomTime key={input.attr}/>;
        }
    }

    renderState = (input, value, onChange) => {
        const {showSelectId, tagCard} = this.state;
        const {className} = this.props;
        const {socket} = this.context;
        switch (tagCard) {
            case "on update":
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        disabled
                        variant="outlined"
                        size="small"
                        value={"system.adapter.ad..."}
                        onChange={onChange}
                        customValue
                    />
                        <CustomButton
                            // fullWidth
                            value='...'
                            className={className}
                            onClick={() => this.setState({showSelectId: true})}
                        />
                    </div>
                    Alive for alarm adapter
                    {showSelectId ? <DialogSelectID
                        key="tableSelect"
                        imagePrefix="../.."
                        dialogName={'javascript'}
                        themeType={Utils.getThemeName()}
                        socket={socket}
                        statesOnly={true}
                        // selected={this.selectIdValue}
                        onClose={() => this.setState({showSelectId: false})}
                        onOk={(selected, name) => {
                            this.setState({showSelectId: false, selectIdValue: selected});
                        }}
                    /> : null}
                </div>;

            case "on change":
                return <div key={input.attr}>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        disabled
                        variant="outlined"
                        size="small"
                        value={"system.adapter.ad..."}
                        onChange={onChange}
                        customValue
                    />
                        <CustomButton
                            // fullWidth
                            value='...'
                            className={className}
                            onClick={() => this.setState({showSelectId: true})}
                        />
                    </div>
                    Alive for alarm adapter
                    {showSelectId ? <DialogSelectID
                        key="tableSelect"
                        imagePrefix="../.."
                        dialogName={'javascript'}
                        themeType={Utils.getThemeName()}
                        socket={socket}
                        statesOnly={true}
                        // selected={this.selectIdValue}
                        onClose={() => this.setState({showSelectId: false})}
                        onOk={(selected, name) => {
                            this.setState({showSelectId: false, selectIdValue: selected});
                        }}
                    /> : null}
                </div>;

            default:
                return <CustomTime key={input.attr}/>;

        }
    }

    renderOnScript = (input, value, onChange) => {
        const {className} = this.props;
        return <div key={input.attr} style={{display: 'flex', alignItems: 'center'}} className={className}>On script save or
            adapter start</div>
    };

    renderDate = (input) => {
        return <CustomTime key={input.attr}/>
    };

    renderInstanceSelection = (input, value, onChange, options) => {
        const {className} = this.props;
        return <CustomSelect
            key={input.attr}
            // title='ip'
            className={className}
            options={options}
            value={'test1'}
            onChange={onChange}
        />
    };

    renderStateCondition = (input, value, onChange) => {
        const {showSelectId, tagCard, openCheckbox} = this.state;
        const {className} = this.props;
        const {socket} = this.context;
        return <div key={input.attr} style={{display: 'flex'}}>
            <div style={{
                fontSize: 30,
                color: '#460f46',
                display: 'flex',
                alignItems: 'center',
                minWidth: 40,
                marginBottom: 30
            }}>
                {tagCard}
            </div>
            <div>
                <div style={{display: 'flex', alignItems: 'center'}}><CustomCheckbox
                    className={className}
                    autoComplete="off"
                    label="number"
                    variant="outlined"
                    size="small"
                    style={{marginRight: 5}}
                    value={openCheckbox}
                    onChange={(e) => this.setState({openCheckbox: e})}
                /> Value from trigger
                </div>

                {openCheckbox && <div>
                    <div style={{display: 'flex', alignItems: 'center'}}><CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        disabled
                        variant="outlined"
                        size="small"
                        value={"system.adapter.ad..."}
                        onChange={onChange}
                        customValue
                    />
                        <CustomButton
                            // fullWidth
                            value='...'
                            className={className}
                            onClick={() => this.setState({showSelectId: true})}
                        />
                    </div>
                    Alive for alarm adapter
                    {showSelectId ? <DialogSelectID
                        key="tableSelect"
                        imagePrefix="../.."
                        dialogName={'javascript'}
                        themeType={Utils.getThemeName()}
                        socket={socket}
                        statesOnly={true}
                        // selected={this.selectIdValue}
                        onClose={() => this.setState({showSelectId: false})}
                        onOk={(selected, name) => {
                            this.setState({showSelectId: false, selectIdValue: selected});
                        }}
                    /> : null}</div>}
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{marginRight: 10, whiteSpace: 'nowrap'}}>
                        greater than
                        </span>
                    <CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        type="number"
                        variant="outlined"
                        size="small"
                        value={30}
                        onChange={onChange}
                        customValue
                    />
                </div>
            </div>
        </div>;
    };

    renderTimeCondition = (input, value, onChange) => {
        const {tagCard} = this.state;
        // const { className } = this.props;
        return <div key={input.attr} style={{display: 'flex'}}>
            <div style={{
                fontSize: 30,
                color: '#460f46',
                display: 'flex',
                alignItems: 'center',
                minWidth: 40,
                marginBottom: 30
            }}>
                {tagCard}
            </div>
            <div>
                <div>Actual time of day</div>
                <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                    greater than <CustomTime style={{marginLeft: 5}}/>
                </div>
            </div>
        </div>;
    };

    renderAstrologicalCondition = (input, value, onChange) => {
        const {openCheckbox} = this.state;
        const {className} = this.props;
        const sunValue = SunCalc.getTimes(new Date(), 51.5, -0.1);
        return <div key={input.attr}>
            <div>Actual time of day</div>
            <div style={{display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
                greater than
                <CustomSelect
                    // title='ip'
                    key='at'
                    className={className}
                    // multiple
                    style={{marginLeft: 5}}
                    options={Object.keys(sunValue).map((name) => ({
                        value: name,
                        title: name,
                        title2: `[${sunValue[name].getHours() < 10 ? 0 : ''}${sunValue[name].getHours()}:${sunValue[name].getMinutes() < 10 ? 0 : ''}${sunValue[name].getMinutes()}]`
                    }))}
                    value={'solarNoon'}
                    onChange={onChange}
                />
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}><CustomCheckbox
                className={className}
                autoComplete="off"
                label="number"
                variant="outlined"
                size="small"
                style={{marginRight: 5}}
                value={openCheckbox}
                onChange={(e) => this.setState({openCheckbox: e})}
            /> with offset
            </div>

            {openCheckbox && <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    label="number"
                    variant="outlined"
                    size="small"
                    type="number"
                    style={{marginLeft: 5, marginRight: 5, width: 80}}
                    value={value}
                    onChange={onChange}
                /> minutes</div>}
            <div style={{display: 'flex', alignItems: 'center'}}>
                {`${sunValue['solarNoon'].getHours() < 10 ? 0 : ''}${sunValue['solarNoon'].getHours()}:${sunValue['solarNoon'].getMinutes() < 10 ? 0 : ''}${sunValue['solarNoon'].getMinutes()}`}</div>
        </div>;
    };

    renderSetStateAction = (input, value, onChange) => {
        const {showSelectId, tagCard} = this.state;
        const {className} = this.props;
        const {socket} = this.context;
        let additionallyBlock = null;
        switch (tagCard) {
            case 'control':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    with
                    <CustomInput
                        className={className}
                        autoComplete="off"
                        label="number"
                        variant="outlined"
                        size="small"
                        type="number"
                        style={{marginLeft: 5, marginRight: 5, width: 80}}
                        value={30}
                        onChange={onChange}
                        customValue
                    />
                    kW
                </div>;
                break;

            case 'update':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    with
                    <CustomInput
                        className={className}
                        autoComplete="off"
                        label="number"
                        variant="outlined"
                        size="small"
                        type="number"
                        style={{marginLeft: 5, marginRight: 5, width: 80}}
                        value={30}
                        onChange={onChange}
                        customValue
                    />
                </div>;
                break;

            case 'control1':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    0 <CustomSlider
                    className={className}
                    autoComplete="off"
                    label="number"
                    variant="outlined"
                    size="small"
                    value={50}
                    onChange={onChange}
                    customValue
                />100
                </div>;
                break;

            case 'control2':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    with
                    <CustomInput
                        className={className}
                        autoComplete="off"
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="color"
                        value={value}
                        onChange={onChange}
                    />
                </div>;
                break;

            case 'control3':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    <CustomSelect
                        // title='ip'
                        className={className}
                        options={[{value: 'State1', title: 'State1'}, {
                            value: 'State2',
                            title: 'State2'
                        }, {value: 'State3', title: 'State3'},]}
                        value={'State1'}
                        onChange={onChange}
                    />
                </div>;
                break;

            case 'control4':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    false
                    <CustomSwitch
                        label=''
                    />
                    true
                </div>;
                break;

            case 'control5':
                additionallyBlock = <div style={{display: 'flex', alignItems: 'center'}}>
                    <CustomButton
                        // fullWidth
                        value='Press'
                        className={className}
                        onClick={onChange}
                    />
                </div>;
                break;

            default:
                additionallyBlock = null;
                break
        }

        return <div key={input.attr}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    disabled
                    variant="outlined"
                    size="small"
                    value={"system.adapter.ad..."}
                    onChange={onChange}
                    customValue
                />
                <CustomButton
                    // fullWidth
                    value='...'
                    className={className}
                    onClick={() => this.setState({showSelectId: true})}
                />
            </div>
            Alive for alarm adapter
            {showSelectId ? <DialogSelectID
                key="tableSelect"
                imagePrefix="../.."
                dialogName={'javascript'}
                themeType={Utils.getThemeName()}
                socket={socket}
                statesOnly={true}
                // selected={this.selectIdValue}
                onClose={() => this.setState({showSelectId: false})}
                onOk={(selected, name) => {
                    this.setState({showSelectId: false, selectIdValue: selected});
                }}
            /> : null}
            <div>
                {additionallyBlock}
            </div>
        </div>;
    };

    renderExecAction = (input, value, onChange) => {
        const {openModal} = this.state;
        const {className} = this.props;
        return <div key={input.attr}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={'value'}
                    onChange={onChange}
                    customValue
                />
                <CustomButton
                    fullWidth
                    style={{width: 80, marginLeft: 5}}
                    value='...'
                    className={className}
                    onClick={() => this.setState({openModal: true})}
                />
            </div>
            <CustomModal
                open={openModal}
                buttonClick={() => {
                    this.setState({openModal: !openModal});
                }}
                close={() => this.setState({openModal: !openModal})}
                titleButton={'add'}
                titleButton2={'close'}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    rows={10}
                    multiline
                    value={value}
                    onChange={onChange}
                />
            </CustomModal>
            Shell command
        </div>;
    };

    renderHTTPCallAction = (input, value, onChange) => {
        const {openModal} = this.state;
        const {className} = this.props;
        return <div key={input.attr}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={'value'}
                    onChange={onChange}
                    customValue
                />
                <CustomButton
                    fullWidth
                    style={{width: 80, marginLeft: 5}}
                    value='...'
                    className={className}
                    onClick={() => this.setState({openModal: true})}
                />
            </div>
            <CustomModal
                open={openModal}
                buttonClick={() => {
                    this.setState({openModal: !openModal});
                }}
                close={() => this.setState({openModal: !openModal})}
                titleButton={'add'}
                titleButton2={'close'}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    rows={10}
                    multiline
                    value={value}
                    onChange={onChange}
                />
            </CustomModal>
            URL
        </div>;
    };

    renderPrintTextAction = (input, value, onChange) => {
        const {openModal} = this.state;
        const {className} = this.props;
        return <div key={input.attr}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={'value'}
                    onChange={onChange}
                    customValue
                />
                <CustomButton
                    fullWidth
                    style={{width: 80, marginLeft: 5}}
                    value='...'
                    className={className}
                    onClick={() => this.setState({openModal: true})}
                />
            </div>
            <CustomModal
                open={openModal}
                buttonClick={() => {
                    this.setState({openModal: !openModal});
                }}
                close={() => this.setState({openModal: !openModal})}
                titleButton={'add'}
                titleButton2={'close'}>
                <CustomInput
                    className={className}
                    autoComplete="off"
                    fullWidth
                    variant="outlined"
                    size="small"
                    rows={10}
                    multiline
                    value={value}
                    onChange={onChange}
                />
            </CustomModal>
            Log text
        </div>;
    };

    renderPauseAction = (input, value, onChange) => {
        const {className} = this.props;
        return <div key={input.attr}>
            <div style={{display: 'flex', alignItems: 'center'}}>
                <CustomInput
                    fullWidth
                    customValue
                    type="number"
                    value={100}
                />
            </div>
            <CustomSelect
                // title='ip'
                key='at'
                className={className}
                options={[{value: 'ms', title: 'ms'}, {value: 's', title: 's'}]}
                value={'ms'}
                onChange={onChange}
            />
        </div>;
    };

    /////////////////////////////
    tagGenerate = () => {
        let {inputs, tagCard, tagCardArray, openTagMenu} = this.state;
        let result;
        if (!tagCardArray) {

            if (inputs.nameRender === 'renderTimeOfDay' && tagCard === '') {
                tagCardArray = ['CRON', 'Wizard', 'Interval', 'at', 'Astro'];
            } else if (inputs.nameRender === 'renderState' && tagCard === '') {
                tagCardArray = ['on update', 'on change'];
            } else if (inputs.nameRender === 'renderStateCondition' && tagCard === '') {
                this.setState({tagCard: '>', tagCardArray: ['>', '>=', '<', '<=', '=', '<>', '...']});
                result = '>';
            } else if ((inputs.nameRender === 'renderTimeCondition' || inputs.nameRender === 'renderAstrologicalCondition') && tagCard === '') {
                tagCardArray = ['>', '>=', '<', '<=', '=', '<>'];
            } else if (inputs.nameRender === 'renderSetStateAction' && tagCard === '') {
                tagCardArray = ['control', 'update'];
            } else {
                tagCardArray = [];
            }

            tagCard = tagCardArray[0] || null;
            this.setState({tagCard, tagCardArray});
            result = tagCard;
        } else {
            result = this.state.tagCard;
        }

        if (tagCardArray.length > 3) {
            result = <div>
                <div aria-controls="simple-menu" aria-haspopup="true"
                     onClick={(e) => this.setState({openTagMenu: e.currentTarget})}>{tagCard}</div>
                <Menu
                    id="simple-menu"
                    anchorEl={openTagMenu}
                    keepMounted
                    open={Boolean(openTagMenu)}
                    onClose={() => this.setState({openTagMenu: null})}
                >
                    {tagCardArray.map(el => <MenuItem key={el} onClick={e => this.setState({
                        openTagMenu: null,
                        tagCard: e.currentTarget.innerText
                    })}>{el}</MenuItem>)}
                </Menu>
            </div>;
        }

        return result || tagCard;
    };

    tagGenerateNew = () => {
        const {tagCard, tagCardArray} = this.state;
        if (tagCard && tagCardArray.length < 4) {
            if (tagCardArray.indexOf(tagCard) === tagCardArray.length - 1) {
                return this.setState({tagCard: tagCardArray[0]});
            }
            this.setState({tagCard: tagCardArray[tagCardArray.indexOf(tagCard) + 1]});
        }
    };

    componentDidMount = async () => {
        await this.tagGenerateNew();
        await this.tagGenerate();
    };

    render = () => {
        const {inputs, tagCard, name, icon} = this.state;
        let _inputs = inputs;
        if (!Array.isArray(inputs)) {
            _inputs = [inputs];
        }
        // const { GenericInputBlockMethod } = this.context.state;
        // console.log('render', inputs, name, icon);
        return <Fragment>
            <MaterialDynamicIcon iconName={icon} className={cls.iconThemCard}/>
            <div className={cls.blockName}>
                <span className={cls.nameCard}>
                    {name && name.en}
                </span>
                {/* {GenericInputBlockMethod[inputs.nameRender] ?
                    GenericInputBlockMethod[inputs.nameRender](inputs.default, () => { }, inputs.options || []) :
                    null} */}
                {_inputs.filter(input => this[input.nameRender])
                    .map(input => {
                        return this[input.nameRender](
                            input.attr,
                            this.state.settings[input.attr] === undefined ? input.default : this.state.settings[input.attr],
                            value => {
                                const settings = JSON.parse(JSON.stringify(this.state.settings));
                                settings[input.attr] = value;
                                this.setState({settings});
                            },
                            input.options || []
                        );
                    })}
            </div>
            {tagCard && <div className={cls.controlMenuTop} style={{opacity: 1, height: 22, top: -22}}>
                <div onClick={async e => {
                    await this.tagGenerateNew();
                    await this.tagGenerate();
                }} className={cls.tagCard}>{this.tagGenerate()}</div>
            </div>}
        </Fragment>;
    };
}

//GenericBlock.contextType = ContextWrapperCreate;
export default GenericBlock;